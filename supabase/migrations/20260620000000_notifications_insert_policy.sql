-- Migration to add insert policy to notifications table
CREATE POLICY "Notifications - Insert Policy" ON public.notifications
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());
