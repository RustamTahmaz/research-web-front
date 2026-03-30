-- Allow users to remove historical request records from their own history
CREATE POLICY "Customers can delete their own historical requests"
  ON public.order_requests FOR DELETE
  USING (
    auth.uid() = customer_id
    AND (status IN ('declined', 'confirmed', 'fulfilled') OR customer_hidden = true)
  );

CREATE POLICY "Farmers can delete their own historical requests"
  ON public.order_requests FOR DELETE
  USING (
    farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid())
    AND (status IN ('declined', 'fulfilled') OR farmer_hidden = true)
  );
