-- Reviews for completed orders (product + farmer feedback)
CREATE TABLE public.order_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_request_id UUID NOT NULL UNIQUE REFERENCES public.order_requests(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_rating INTEGER,
  product_review_text TEXT,
  farmer_rating INTEGER,
  farmer_review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT product_rating_range CHECK (product_rating IS NULL OR (product_rating >= 1 AND product_rating <= 5)),
  CONSTRAINT farmer_rating_range CHECK (farmer_rating IS NULL OR (farmer_rating >= 1 AND farmer_rating <= 5)),
  CONSTRAINT product_text_needs_rating CHECK (product_review_text IS NULL OR product_rating IS NOT NULL),
  CONSTRAINT farmer_text_needs_rating CHECK (farmer_review_text IS NULL OR farmer_rating IS NOT NULL),
  CONSTRAINT at_least_one_rating CHECK (product_rating IS NOT NULL OR farmer_rating IS NOT NULL)
);

CREATE INDEX idx_order_reviews_farmer_id ON public.order_reviews(farmer_id);
CREATE INDEX idx_order_reviews_product_id ON public.order_reviews(product_id);
CREATE INDEX idx_order_reviews_created_at ON public.order_reviews(created_at DESC);

ALTER TABLE public.order_reviews ENABLE ROW LEVEL SECURITY;

-- Public can read ratings/reviews
CREATE POLICY "Public can read order reviews"
  ON public.order_reviews FOR SELECT
  USING (true);

-- Only the purchasing customer of a fulfilled order can create a review
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

-- Customer can edit only their own review for their fulfilled order
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

-- Keep updated_at in sync
CREATE TRIGGER update_order_reviews_updated_at
BEFORE UPDATE ON public.order_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
