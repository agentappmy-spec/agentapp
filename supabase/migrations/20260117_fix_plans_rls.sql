-- Create a secure function to check for super_admin role
-- This bypasses RLS on the profiles table using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for PLANS table to use the new function

-- Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Allow super_admin update" ON public.plans;
DROP POLICY IF EXISTS "Allow super_admin insert" ON public.plans;
DROP POLICY IF EXISTS "Allow super_admin delete" ON public.plans;

-- Create new robust policies
CREATE POLICY "Allow super_admin update" ON public.plans
FOR UPDATE USING (is_super_admin());

CREATE POLICY "Allow super_admin insert" ON public.plans
FOR INSERT WITH CHECK (is_super_admin());

CREATE POLICY "Allow super_admin delete" ON public.plans
FOR DELETE USING (is_super_admin());

-- Ensure public read access remains
DROP POLICY IF EXISTS "Allow public read access" ON public.plans;
CREATE POLICY "Allow public read access" ON public.plans
FOR SELECT USING (true);
