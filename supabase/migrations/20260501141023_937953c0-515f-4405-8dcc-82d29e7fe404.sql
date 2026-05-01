
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
  v_default_agents text[] := ARRAY[
    'finance','marketing','sales','people','ops',
    'compliance','it','knowledge','cs','procurement'
  ];
  v_agent text;
  v_idx int := 0;
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

  -- Seed the 10 default specialist agents into this workspace's roster.
  FOREACH v_agent IN ARRAY v_default_agents LOOP
    INSERT INTO public.hired_agents (
      workspace_id, user_id, agent_id, grid_x, grid_y
    )
    VALUES (
      v_workspace_id, p_user_id, v_agent, v_idx % 5, v_idx / 5
    );
    v_idx := v_idx + 1;
  END LOOP;

  RETURN v_workspace_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_workspace_with_owner(uuid, text, text, text, text, text, text, text, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_workspace_with_owner(uuid, text, text, text, text, text, text, text, jsonb, text) TO service_role;
