-- Remove duplicate workflow_steps records
-- Keep only one record per unique combination of (template_id, trigger_name, day)

-- First, create a temporary table with unique records (keeping the oldest one by id)
CREATE TEMP TABLE workflow_steps_unique AS
SELECT DISTINCT ON (template_id, trigger_name, COALESCE(day, -1), COALESCE(date, ''))
    *
FROM public.workflow_steps
ORDER BY template_id, trigger_name, COALESCE(day, -1), COALESCE(date, ''), created_at ASC;

-- Delete all records from the original table
DELETE FROM public.workflow_steps;

-- Insert back only the unique records
INSERT INTO public.workflow_steps
SELECT * FROM workflow_steps_unique;

-- Drop the temporary table
DROP TABLE workflow_steps_unique;
