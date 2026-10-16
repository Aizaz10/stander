-- ==============================================================================
-- City-Based Shipping Fee Migration (Karachi Rs. 250, Other Cities Rs. 350)
-- Safe to run once or re-run in Supabase SQL Editor (after guest-checkout.sql)
-- ==============================================================================

-- 1. Alter orders table to add shipping_fee column if not exists
-- Existing orders retain default 0 so their historic totals remain unchanged
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_fee numeric(10,2) NOT NULL DEFAULT 0;

-- 2. Update place_order function to compute city-based delivery charge
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
    v_city text;
    v_shipping_fee numeric := 0;
    v_item record;
    v_product record;
    v_item_price numeric;
    v_clean_phone text;
    v_clean_email text;
    v_items_count int;
BEGIN
    -- 1. Determine user_id (NULL for guests, auth.uid() for authenticated users)
    v_user_id := auth.uid();

    -- 2. Validate input fields
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        RAISE EXCEPTION 'Full name is required';
    END IF;

    IF p_address IS NULL OR TRIM(p_address) = '' THEN
        RAISE EXCEPTION 'Shipping address is required';
    END IF;

    IF p_city IS NULL OR TRIM(p_city) = '' THEN
        RAISE EXCEPTION 'City is required';
    END IF;

    -- Validate phone (must have at least 10 digits after stripping non-digits)
    v_clean_phone := regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g');
    IF LENGTH(v_clean_phone) < 10 THEN
        RAISE EXCEPTION 'Phone number must contain at least 10 digits';
    END IF;

    -- Validate optional email
    v_clean_email := NULLIF(TRIM(COALESCE(p_email, '')), '');
    IF v_clean_email IS NOT NULL AND v_clean_email NOT LIKE '%@%' THEN
        RAISE EXCEPTION 'Please provide a valid email address';
    END IF;

    -- Validate items array
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

    -- Compute shipping fee securely on database side based on normalized city
    v_city := lower(btrim(p_city));
    v_shipping_fee := CASE WHEN v_city = 'karachi' THEN 250 ELSE 350 END;

    -- 3. Create the pending order record first
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
        v_clean_email,
        'pending',
        'cod',
        TRIM(p_name),
        TRIM(p_phone),
        TRIM(p_address),
        TRIM(p_city),
        v_shipping_fee,
        0 -- Will update after computing DB prices
    ) RETURNING id, order_number INTO v_order_id, v_order_number;

    -- 4. Process each item in the cart
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

    -- 5. Calculate total = subtotal + shipping_fee and update the order
    v_total := v_subtotal + v_shipping_fee;

    UPDATE public.orders 
    SET total = v_total,
        shipping_fee = v_shipping_fee
    WHERE id = v_order_id;

    -- 6. Return id, order_number, and total as JSON
    RETURN jsonb_build_object(
        'id', v_order_id,
        'order_number', v_order_number,
        'total', v_total
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution to both anonymous visitors and authenticated users
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, text, text, text, text, text) TO anon, authenticated;


-- 3. Update track_order function to return shipping_fee
CREATE OR REPLACE FUNCTION public.track_order(
    p_order_number bigint,
    p_phone text
) RETURNS jsonb AS $$
DECLARE
    v_order record;
    v_clean_phone text;
    v_search_phone_last10 text;
    v_items jsonb;
BEGIN
    -- 1. Validate inputs
    IF p_order_number IS NULL OR p_order_number <= 0 THEN
        RETURN NULL;
    END IF;

    v_clean_phone := regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g');
    IF LENGTH(v_clean_phone) < 10 THEN
        RETURN NULL;
    END IF;

    v_search_phone_last10 := RIGHT(v_clean_phone, 10);

    -- 2. Lookup order matching order_number and last 10 digits of phone
    SELECT * INTO v_order
    FROM public.orders
    WHERE order_number = p_order_number
      AND RIGHT(regexp_replace(COALESCE(shipping_phone, ''), '\D', '', 'g'), 10) = v_search_phone_last10;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- 3. Retrieve order items
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'product_name', oi.product_name,
                'price', oi.price,
                'quantity', oi.quantity
            )
        ),
        '[]'::jsonb
    ) INTO v_items
    FROM public.order_items oi
    WHERE oi.order_id = v_order.id;

    -- 4. Return order details including shipping_fee
    RETURN jsonb_build_object(
        'order_number', v_order.order_number,
        'status', v_order.status,
        'created_at', v_order.created_at,
        'total', v_order.total,
        'shipping_fee', COALESCE(v_order.shipping_fee, 0),
        'shipping_name', v_order.shipping_name,
        'shipping_address', v_order.shipping_address,
        'shipping_city', v_order.shipping_city,
        'items', v_items
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution to both anonymous visitors and authenticated users
GRANT EXECUTE ON FUNCTION public.track_order(bigint, text) TO anon, authenticated;
