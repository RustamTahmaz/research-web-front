-- Allow reviews after fulfilled orders only
DROP POLICY IF EXISTS "Customers can create review for fulfilled orders" ON public.order_reviews;
DROP POLICY IF EXISTS "Customers can update their own fulfilled-order reviews" ON public.order_reviews;
DROP POLICY IF EXISTS "Customers can create review for confirmed or fulfilled orders" ON public.order_reviews;
DROP POLICY IF EXISTS "Customers can update their own confirmed-order reviews" ON public.order_reviews;

CREATE POLICY "Customers can create review for fulfilled orders"
  ON public.order_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1
      FROM public.order_requests r
      WHERE r.id = order_request_id
        AND r.status = 'fulfilled'
        AND r.customer_id = auth.uid()
        AND r.farmer_id = order_reviews.farmer_id
        AND r.product_id = order_reviews.product_id
    )
  );

CREATE POLICY "Customers can update their own fulfilled-order reviews"
  ON public.order_reviews FOR UPDATE
  USING (auth.uid() = customer_id)
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1
      FROM public.order_requests r
      WHERE r.id = order_request_id
        AND r.status = 'fulfilled'
        AND r.customer_id = auth.uid()
    )
  );
