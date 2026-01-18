-- Allow Super Admins to delete profiles
CREATE POLICY "Super admins can delete profiles" ON public.profiles
    FOR DELETE USING (is_super_admin());
