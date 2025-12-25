-- Create role enum for users
CREATE TYPE public.user_role AS ENUM ('farmer', 'customer');

-- Create profiles table for basic user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create farmer_profiles table for farmer-specific info
CREATE TABLE public.farmer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  farm_name TEXT NOT NULL,
  farm_location TEXT NOT NULL,
  farm_size TEXT,
  product_types TEXT[],
  description TEXT,
  years_of_experience INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create customer_profiles table for customer-specific info
CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  delivery_address TEXT,
  city TEXT,
  preferred_categories TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Public profiles are viewable (for marketplace)
CREATE POLICY "Public profiles are viewable"
  ON public.profiles FOR SELECT
  USING (true);

-- RLS policies for farmer_profiles
CREATE POLICY "Farmers can view their own farmer profile"
  ON public.farmer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Farmers can update their own farmer profile"
  ON public.farmer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Farmers can insert their own farmer profile"
  ON public.farmer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public farmer profiles are viewable (for marketplace)
CREATE POLICY "Public farmer profiles are viewable"
  ON public.farmer_profiles FOR SELECT
  USING (true);

-- RLS policies for customer_profiles
CREATE POLICY "Customers can view their own customer profile"
  ON public.customer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Customers can update their own customer profile"
  ON public.customer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Customers can insert their own customer profile"
  ON public.customer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farmer_profiles_updated_at
  BEFORE UPDATE ON public.farmer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();