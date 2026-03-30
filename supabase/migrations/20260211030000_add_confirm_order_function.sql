-- Function to confirm order and decrement stock atomically
CREATE OR REPLACE FUNCTION public.confirm_order(p_request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
  v_qty INTEGER;
  v_new_qty INTEGER;
BEGIN
  SELECT *
  INTO v_request
  FROM public.order_requests
  WHERE id = p_request_id;

  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF v_request.customer_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF v_request.status = 'approved' THEN
    v_qty := v_request.requested_quantity;
  ELSIF v_request.status = 'countered' THEN
    v_qty := v_request.counter_quantity;
  ELSE
    RAISE EXCEPTION 'Request not confirmable';
  END IF;

  IF v_qty IS NULL OR v_qty <= 0 THEN
    RAISE EXCEPTION 'Invalid quantity';
  END IF;

  SELECT quantity_available INTO v_new_qty
  FROM public.products
  WHERE id = v_request.product_id
  FOR UPDATE;

  v_new_qty := v_new_qty - v_qty;
  IF v_new_qty < 0 THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;

  UPDATE public.products
  SET quantity_available = v_new_qty,
      is_available = (v_new_qty > 0)
  WHERE id = v_request.product_id;

  UPDATE public.order_requests
  SET status = 'confirmed',
      requested_quantity = v_qty,
      counter_quantity = NULL
  WHERE id = p_request_id;
END;
$$;

-- Allow authenticated users to execute
GRANT EXECUTE ON FUNCTION public.confirm_order(UUID) TO authenticated;
