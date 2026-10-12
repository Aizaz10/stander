-- Function: admin_update_order_status
-- Allows admins to securely transition order statuses and automatically restore stock upon cancellation

CREATE OR REPLACE FUNCTION admin_update_order_status(
    p_order_id uuid,
    p_status text
) RETURNS void AS $$
DECLARE
    v_order record;
    v_item record;
BEGIN
    -- 1. Check if caller is admin
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Administrator privileges required.';
    END IF;

    -- 2. Validate p_status
    IF p_status NOT IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid status: %. Must be one of: pending, confirmed, shipped, delivered, cancelled.', p_status;
    END IF;

    -- 3. Load the order and lock for update
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found', p_order_id;
    END IF;

    -- Refuse to change an order that is already 'cancelled' or 'delivered'
    IF v_order.status IN ('cancelled', 'delivered') THEN
        RAISE EXCEPTION 'Cannot modify an order that is already %.', v_order.status;
    END IF;

    -- 4. If new status is 'cancelled' and old status is not 'cancelled', restore stock
    IF p_status = 'cancelled' AND v_order.status <> 'cancelled' THEN
        FOR v_item IN
            SELECT product_id, quantity
            FROM public.order_items
            WHERE order_id = p_order_id
        LOOP
            IF v_item.product_id IS NOT NULL AND v_item.quantity > 0 THEN
                UPDATE public.products
                SET stock = stock + v_item.quantity
                WHERE id = v_item.product_id;
            END IF;
        END LOOP;
    END IF;

    -- 5. Update orders.status
    UPDATE public.orders
    SET status = p_status
    WHERE id = p_order_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution to authenticated users only (internal check verifies is_admin())
GRANT EXECUTE ON FUNCTION admin_update_order_status(uuid, text) TO authenticated;
