-- Extend order_status enum for counter offers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'countered'
  ) THEN
    ALTER TYPE public.order_status ADD VALUE 'countered';
  END IF;
END$$;

-- Add counter fields to order_requests
ALTER TABLE public.order_requests
  ADD COLUMN counter_quantity INTEGER,
  ADD COLUMN farmer_message TEXT;
