-- ==============================================================================
-- Stander Trader: Enhanced Input Validation & Phone Normalization for place_order
-- Run this in the Supabase SQL Editor after shipping-fee.sql
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.place_order(
    p_items jsonb,
    p_name text,
    p_phone text,
    p_address text,
    p_city text,
    p_email text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
    v_user_id uuid;
    v_order_id uuid;
    v_order_number bigint;
    v_subtotal numeric := 0;
    v_total numeric := 0;
    v_shipping_fee numeric := 0;
    v_item record;
    v_product record;
    v_item_price numeric;
    v_items_count int;
    
    -- Trimmed and normalized variables
    v_name text;
    v_address text;
    v_city text;
    v_email text;
    v_raw_phone text;
    v_norm_phone text;
BEGIN
    -- 1. Determine user_id (NULL for guests, auth.uid() for authenticated users)
    v_user_id := auth.uid();

    -- 2. Clean input strings
    v_name := btrim(COALESCE(p_name, ''));
    v_address := btrim(COALESCE(p_address, ''));
    v_city := btrim(COALESCE(p_city, ''));
    v_email := NULLIF(btrim(COALESCE(p_email, '')), '');

    -- 3. Validate name (2 to 100 characters)
    IF length(v_name) < 2 OR length(v_name) > 100 THEN
        RAISE EXCEPTION 'Full name must be between 2 and 100 characters';
    END IF;

    -- 4. Validate address (10 to 300 characters)
    IF length(v_address) < 10 OR length(v_address) > 300 THEN
        RAISE EXCEPTION 'Shipping address must be between 10 and 300 characters';
    END IF;

    -- 5. Validate city (2 to 60 characters)
    IF length(v_city) < 2 OR length(v_city) > 60 THEN
        RAISE EXCEPTION 'City must be between 2 and 60 characters';
    END IF;

    -- 6. Normalize and validate Pakistani mobile phone number
    -- Strip non-digits
    v_raw_phone := regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g');

    IF v_raw_phone LIKE '0092%' AND length(v_raw_phone) = 14 THEN
        v_norm_phone := '0' || right(v_raw_phone, 10);
    ELSIF v_raw_phone LIKE '92%' AND length(v_raw_phone) = 12 THEN
        v_norm_phone := '0' || right(v_raw_phone, 10);
    ELSIF v_raw_phone LIKE '3%' AND length(v_raw_phone) = 10 THEN
        v_norm_phone := '0' || v_raw_phone;
    ELSE
        v_norm_phone := v_raw_phone;
    END IF;

    IF v_norm_phone !~ '^03[0-9]{9}$' THEN
        RAISE EXCEPTION 'Invalid phone number';
    END IF;

    -- 7. Validate email if provided (max 254 chars, valid format)
    IF v_email IS NOT NULL AND (length(v_email) > 254 OR v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$') THEN
        RAISE EXCEPTION 'Please provide a valid email address';
    END IF;

    -- 8. Validate items array
    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
        RAISE EXCEPTION 'Invalid items payload';
    END IF;

    v_items_count := jsonb_array_length(p_items);
    IF v_items_count = 0 THEN
        RAISE EXCEPTION 'Your cart is empty';
    END IF;

    IF v_items_count > 20 THEN
        RAISE EXCEPTION 'Cannot order more than 20 distinct items at once';
    END IF;

    -- 9. Compute shipping fee securely on database side based on normalized city
    v_shipping_fee := CASE WHEN lower(v_city) = 'karachi' THEN 250 ELSE 350 END;

    -- 10. Create the pending order record first
    INSERT INTO public.orders (
        user_id,
        guest_email,
        status,
        payment_method,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_fee,
        total
    ) VALUES (
        v_user_id,
        v_email,
        'pending',
        'cod',
        v_name,
        v_norm_phone,
        v_address,
        v_city,
        v_shipping_fee,
        0 -- Will update after computing DB prices
    ) RETURNING id, order_number INTO v_order_id, v_order_number;

    -- 11. Process each item in the cart
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity int)
    LOOP
        -- Validate item quantity
        IF v_item.quantity IS NULL OR v_item.quantity < 1 OR v_item.quantity > 20 THEN
            RAISE EXCEPTION 'Quantity for each item must be between 1 and 20';
        END IF;

        -- Fetch the product details and lock the row for update to prevent race conditions
        SELECT * INTO v_product 
        FROM public.products 
        WHERE id = v_item.product_id AND is_active = true
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % is no longer available', v_item.product_id;
        END IF;

        IF v_product.stock < v_item.quantity THEN
            RAISE EXCEPTION 'Not enough stock for %. Only % left in stock.', v_product.name, v_product.stock;
        END IF;

        -- Trusted DB price
        v_item_price := v_product.price;
        
        -- Running subtotal
        v_subtotal := v_subtotal + (v_item_price * v_item.quantity);

        -- Insert order item
        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            price,
            quantity
        ) VALUES (
            v_order_id,
            v_product.id,
            v_product.name,
            v_item_price,
            v_item.quantity
        );

        -- Decrement product stock
        UPDATE public.products 
        SET stock = stock - v_item.quantity 
        WHERE id = v_product.id;
        
    END LOOP;

    -- 12. Calculate total = subtotal + shipping_fee and update the order
    v_total := v_subtotal + v_shipping_fee;

    UPDATE public.orders 
    SET total = v_total,
        shipping_fee = v_shipping_fee
    WHERE id = v_order_id;

    -- 13. Return id, order_number, and total as JSON
    RETURN jsonb_build_object(
        'id', v_order_id,
        'order_number', v_order_number,
        'total', v_total
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution to both anonymous visitors and authenticated users
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, text, text, text, text, text) TO anon, authenticated;
