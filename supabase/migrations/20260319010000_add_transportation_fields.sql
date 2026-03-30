-- Transportation and delivery planning for confirmed orders
CREATE TYPE public.delivery_method AS ENUM ('pickup', 'third_party');
CREATE TYPE public.delivery_provider_type AS ENUM ('farmer', 'company', 'local_carrier');
CREATE TYPE public.delivery_schedule_type AS ENUM ('asap', 'scheduled');
CREATE TYPE public.delivery_status AS ENUM ('pending_pickup', 'in_transit', 'delivered');
CREATE TYPE public.refund_status AS ENUM ('none', 'requested', 'refunded');

ALTER TABLE public.order_requests
  ADD COLUMN delivery_method public.delivery_method,
  ADD COLUMN delivery_provider_type public.delivery_provider_type,
  ADD COLUMN delivery_address TEXT,
  ADD COLUMN delivery_distance_km NUMERIC(10,2),
  ADD COLUMN delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN delivery_schedule_type public.delivery_schedule_type,
  ADD COLUMN delivery_scheduled_for TIMESTAMP WITH TIME ZONE,
  ADD COLUMN delivery_status public.delivery_status,
  ADD COLUMN delivery_notes TEXT,
  ADD COLUMN refund_status public.refund_status NOT NULL DEFAULT 'none';

ALTER TABLE public.order_requests
  ADD CONSTRAINT delivery_address_required_for_third_party
    CHECK (delivery_method <> 'third_party' OR delivery_address IS NOT NULL),
  ADD CONSTRAINT delivery_provider_required_for_third_party
    CHECK (delivery_method <> 'third_party' OR delivery_provider_type IS NOT NULL),
  ADD CONSTRAINT delivery_schedule_required_when_method_selected
    CHECK (delivery_method IS NULL OR delivery_schedule_type IS NOT NULL),
  ADD CONSTRAINT delivery_schedule_timestamp_required
    CHECK (delivery_schedule_type <> 'scheduled' OR delivery_scheduled_for IS NOT NULL),
  ADD CONSTRAINT delivery_status_requires_method
    CHECK (delivery_status IS NULL OR delivery_method IS NOT NULL);

CREATE INDEX idx_order_requests_delivery_status ON public.order_requests(delivery_status);
