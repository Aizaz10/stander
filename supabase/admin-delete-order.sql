-- Function: admin_delete_order
-- Allows admins to delete orders and automatically restore stock if the order was not cancelled or delivered

CREATE OR REPLACE FUNCTION admin_delete_order(
    p_order_id uuid
) RETURNS void AS $$
DECLARE
    v_order record;
BEGIN
    -- 1. Check if caller is admin
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Administrator privileges required.';
    END IF;

    -- 2. Load the order and lock for update
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    -- 3. If order status is pending, confirmed, or shipped, restore stock
    IF v_order.status IN ('pending', 'confirmed', 'shipped') THEN
        UPDATE public.products
        SET stock = products.stock + oi.quantity
        FROM public.order_items oi
        WHERE oi.order_id = p_order_id
          AND products.id = oi.product_id;
    END IF;

    -- 4. Delete the order (order_items are ON DELETE CASCADE)
    DELETE FROM public.orders
    WHERE id = p_order_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke all execute privileges by default
REVOKE EXECUTE ON FUNCTION admin_delete_order(uuid) FROM PUBLIC, anon;

-- Grant execution to authenticated users only (internal check verifies is_admin())
GRANT EXECUTE ON FUNCTION admin_delete_order(uuid) TO authenticated;
