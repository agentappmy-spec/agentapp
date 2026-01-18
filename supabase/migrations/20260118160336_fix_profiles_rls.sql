-- Ensure is_super_admin function exists and is secure
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update RLS policies for PROFILES to use the function and avoid recursion

-- Drop potentially recursive policies
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;

-- Create new non-recursive policies
CREATE POLICY "Super admins can view all profiles" ON public.profiles
    FOR SELECT USING (is_super_admin());

CREATE POLICY "Super admins can update all profiles" ON public.profiles
    FOR UPDATE USING (is_super_admin());
