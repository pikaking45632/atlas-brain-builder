
REVOKE EXECUTE ON FUNCTION public.create_workspace_with_owner(uuid, text, text, text, text, text, text, text, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_workspace_with_owner(uuid, text, text, text, text, text, text, text, jsonb, text) TO service_role;
