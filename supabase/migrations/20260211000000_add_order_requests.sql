-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'approved', 'declined', 'confirmed', 'fulfilled');

-- Create order_requests table
CREATE TABLE public.order_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  farmer_id UUID NOT NULL REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
  status order_status NOT NULL DEFAULT 'pending',
  customer_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_requests ENABLE ROW LEVEL SECURITY;

-- Customers can view their own requests
CREATE POLICY "Customers can view their own requests"
  ON public.order_requests FOR SELECT
  USING (auth.uid() = customer_id);

-- Farmers can view requests for their products
CREATE POLICY "Farmers can view their incoming requests"
  ON public.order_requests FOR SELECT
  USING (
    farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid())
  );

-- Customers can insert their own requests
CREATE POLICY "Customers can create requests"
  ON public.order_requests FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'customer'
    )
  );

-- Customers can update their own requests (e.g., confirm)
CREATE POLICY "Customers can update their own requests"
  ON public.order_requests FOR UPDATE
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- Farmers can update requests for their products (approve/decline/fulfill)
CREATE POLICY "Farmers can update their incoming requests"
  ON public.order_requests FOR UPDATE
  USING (
    farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_order_requests_farmer_id ON public.order_requests(farmer_id);
CREATE INDEX idx_order_requests_customer_id ON public.order_requests(customer_id);
CREATE INDEX idx_order_requests_status ON public.order_requests(status);
CREATE INDEX idx_order_requests_product_id ON public.order_requests(product_id);

-- Add trigger for updated_at
CREATE TRIGGER update_order_requests_updated_at
BEFORE UPDATE ON public.order_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
