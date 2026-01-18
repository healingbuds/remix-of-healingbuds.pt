-- Fix overpermissive RLS policy on drgreen_clients
-- Users should NOT be able to update eligibility fields (is_kyc_verified, admin_approval)
-- These fields should ONLY be updatable via webhook or admin

-- Drop the existing overpermissive policy
DROP POLICY IF EXISTS "Users can update their own drgreen client" ON public.drgreen_clients;

-- Create restrictive policy that prevents users from updating eligibility fields
-- Users can only update: country_code (for region preference)
-- They CANNOT update: is_kyc_verified, admin_approval, drgreen_client_id
CREATE POLICY "Users can update non-eligibility fields only" 
ON public.drgreen_clients 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Ensure eligibility fields are not changed by comparing with existing values
  is_kyc_verified IS NOT DISTINCT FROM (SELECT dc.is_kyc_verified FROM public.drgreen_clients dc WHERE dc.id = drgreen_clients.id) AND
  admin_approval IS NOT DISTINCT FROM (SELECT dc.admin_approval FROM public.drgreen_clients dc WHERE dc.id = drgreen_clients.id) AND
  drgreen_client_id IS NOT DISTINCT FROM (SELECT dc.drgreen_client_id FROM public.drgreen_clients dc WHERE dc.id = drgreen_clients.id)
);

-- Create admin-only policy for updating eligibility fields
CREATE POLICY "Admins can update all client fields" 
ON public.drgreen_clients 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add policy for webhook/service role updates (uses service role key which bypasses RLS)
-- Note: Service role already bypasses RLS, so no explicit policy needed

-- Add explicit SELECT policy for admins to view all clients
CREATE POLICY "Admins can view all drgreen clients" 
ON public.drgreen_clients 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Fix dispensary_notifications table - add explicit policy to prevent unauthorized reads
-- Ensure only admins can read notification emails
DROP POLICY IF EXISTS "Admins can view notifications" ON public.dispensary_notifications;

CREATE POLICY "Only admins can view notifications" 
ON public.dispensary_notifications 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));