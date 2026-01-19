-- Add user_id to workflow_steps to allow personalization
ALTER TABLE public.workflow_steps 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id);

-- Update RLS Policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.workflow_steps;
CREATE POLICY "Enable read access for authenticated users" ON public.workflow_steps 
FOR SELECT TO authenticated 
USING (
    user_id IS NULL OR user_id = auth.uid()
);

DROP POLICY IF EXISTS "Enable write access for super admins" ON public.workflow_steps;
-- Allow users to create their own steps
CREATE POLICY "Enable insert for authenticated users" ON public.workflow_steps 
FOR INSERT TO authenticated 
WITH CHECK (
    user_id = auth.uid() OR 
    (user_id IS NULL AND exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'))
);

-- Allow users to update ONLY their own steps
CREATE POLICY "Enable update for authenticated users" ON public.workflow_steps 
FOR UPDATE TO authenticated 
USING (
    user_id = auth.uid() OR 
    (user_id IS NULL AND exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'))
);

-- Allow users to delete ONLY their own steps
CREATE POLICY "Enable delete for authenticated users" ON public.workflow_steps 
FOR DELETE TO authenticated 
USING (
    user_id = auth.uid() OR 
    (user_id IS NULL AND exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'))
);

-- Add index for performance check
CREATE INDEX IF NOT EXISTS idx_workflow_steps_user_id ON public.workflow_steps(user_id);
