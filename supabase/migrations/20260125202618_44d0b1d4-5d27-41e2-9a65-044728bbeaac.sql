-- Create products table linked to farmers
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  quantity_available INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are publicly viewable
CREATE POLICY "Products are publicly viewable"
ON public.products FOR SELECT
USING (true);

-- Farmers can insert their own products
CREATE POLICY "Farmers can insert their own products"
ON public.products FOR INSERT
WITH CHECK (
  farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid())
);

-- Farmers can update their own products
CREATE POLICY "Farmers can update their own products"
ON public.products FOR UPDATE
USING (
  farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid())
);

-- Farmers can delete their own products
CREATE POLICY "Farmers can delete their own products"
ON public.products FOR DELETE
USING (
  farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid())
);

-- Create index for faster category queries
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_farmer_id ON public.products(farmer_id);

-- Add trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();