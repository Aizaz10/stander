-- Create the place_order function to handle secure checkout logic
CREATE OR REPLACE FUNCTION place_order(
    p_items jsonb,
    p_name text,
    p_phone text,
    p_address text,
    p_city text
) RETURNS uuid AS $$
DECLARE
    v_user_id uuid;
    v_order_id uuid;
    v_total numeric := 0;
    v_item record;
    v_product record;
    v_item_price numeric;
BEGIN
    -- 1. Ensure user is authenticated
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Create the pending order record first to get the ID
    INSERT INTO public.orders (
        user_id,
        status,
        payment_method,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        total
    ) VALUES (
        v_user_id,
        'pending',
        'cod',
        p_name,
        p_phone,
        p_address,
        p_city,
        0 -- Will update later
    ) RETURNING id INTO v_order_id;

    -- 3. Process each item in the cart
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity int)
    LOOP
        -- Fetch the product details and lock the row for update to prevent race conditions
        SELECT * INTO v_product 
        FROM public.products 
        WHERE id = v_item.product_id AND is_active = true
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % is no longer available', v_item.product_id;
        END IF;

        IF v_product.stock < v_item.quantity THEN
            RAISE EXCEPTION 'Not enough stock for %', v_product.name;
        END IF;

        -- Use the trusted database price
        v_item_price := v_product.price;
        
        -- Calculate the line total and add to the running total
        v_total := v_total + (v_item_price * v_item.quantity);

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

        -- Decrement stock
        UPDATE public.products 
        SET stock = stock - v_item.quantity 
        WHERE id = v_product.id;
        
    END LOOP;

    -- 4. Update the order with the final computed total
    UPDATE public.orders 
    SET total = v_total 
    WHERE id = v_order_id;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution rights to authenticated users
GRANT EXECUTE ON FUNCTION place_order(jsonb, text, text, text, text) TO authenticated;
