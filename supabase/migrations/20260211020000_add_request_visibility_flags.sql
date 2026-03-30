-- Add per-user visibility flags for request history
ALTER TABLE public.order_requests
  ADD COLUMN customer_hidden BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN farmer_hidden BOOLEAN NOT NULL DEFAULT false;
