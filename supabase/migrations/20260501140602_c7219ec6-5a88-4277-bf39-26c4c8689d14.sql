
-- Clean up orphaned workspaces (no members)
DELETE FROM public.workspaces
WHERE id NOT IN (SELECT workspace_id FROM public.workspace_members);

-- Atomic create-workspace-with-owner function
CREATE OR REPLACE FUNCTION public.create_workspace_with_owner(
  p_user_id uuid,
  p_name text,
  p_slug text,
  p_email_domain text,
  p_industry text,
  p_team_size text,
  p_country text,
  p_business_type text,
  p_selected_modules jsonb,
  p_plan text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id uuid;
BEGIN
  INSERT INTO public.workspaces (
    name, slug, email_domain, industry, team_size, country,
    business_type, selected_modules, plan, created_by
  )
  VALUES (
    p_name, p_slug, p_email_domain, p_industry, p_team_size, p_country,
    p_business_type, COALESCE(p_selected_modules, '[]'::jsonb), COALESCE(p_plan, 'trial'), p_user_id
  )
  RETURNING id INTO v_workspace_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, p_user_id, 'owner');

  RETURN v_workspace_id;
END;
$$;
