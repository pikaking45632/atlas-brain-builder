-- ============================================================================
-- Atlas — Multi-tenancy + Auth foundation
-- ============================================================================
-- Adds workspaces (per-company) + workspace_members (per-user-membership).
-- Documents and other shared resources are scoped to workspaces.
-- Chat history is per-user, scoped to a workspace.
--
-- Idempotent. Safe to run multiple times.
-- Backwards compatible: keeps `user_id` columns on existing tables so old
-- code paths keep working until they're migrated; adds `workspace_id` as
-- the new authoritative column.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. workspaces — one row per company / customer organisation
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
    DEFAULT lower(regexp_replace(encode(gen_random_bytes(6), 'hex'), '[^a-z0-9]', '', 'g')),
  email_domain TEXT,
  industry TEXT,
  team_size TEXT,
  country TEXT,
  business_type TEXT,
  selected_modules JSONB DEFAULT '[]'::jsonb,
  plan TEXT DEFAULT 'trial',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;


-- ----------------------------------------------------------------------------
-- 2. workspace_members — links users to workspaces with a role
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT workspace_members_unique UNIQUE (workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace
  ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user
  ON public.workspace_members(user_id);


-- ----------------------------------------------------------------------------
-- 3. Helper function — is this user a member of this workspace?
-- ----------------------------------------------------------------------------
-- Used in RLS policies. SECURITY DEFINER avoids recursive RLS evaluation
-- when policies on workspace_members are themselves checking membership.

CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = p_workspace_id
      AND user_id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = p_workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_workspace_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_workspace_admin(UUID) TO authenticated;


-- ----------------------------------------------------------------------------
-- 4. RLS policies for workspaces and workspace_members
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members view their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Authenticated users create workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Admins update their workspace" ON public.workspaces;

CREATE POLICY "Members view their workspaces"
  ON public.workspaces FOR SELECT
  USING (public.is_workspace_member(id));

CREATE POLICY "Authenticated users create workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

CREATE POLICY "Admins update their workspace"
  ON public.workspaces FOR UPDATE
  USING (public.is_workspace_admin(id));


DROP POLICY IF EXISTS "Members view their memberships" ON public.workspace_members;
DROP POLICY IF EXISTS "Members view memberships in their workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins manage memberships" ON public.workspace_members;
DROP POLICY IF EXISTS "Self-join via Edge Function" ON public.workspace_members;

-- A user can see their own membership rows AND the membership rows of their
-- co-workspace-members (so the team sidebar can list other members).
CREATE POLICY "Members view memberships in their workspaces"
  ON public.workspace_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_workspace_member(workspace_id)
  );

CREATE POLICY "Admins manage memberships"
  ON public.workspace_members FOR ALL
  USING (public.is_workspace_admin(workspace_id))
  WITH CHECK (public.is_workspace_admin(workspace_id));


-- ----------------------------------------------------------------------------
-- 5. Add workspace_id to existing tables (backward compatible)
-- ----------------------------------------------------------------------------

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.hired_agents
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.connected_sources
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_documents_workspace ON public.documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_profiles_workspace ON public.profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invitations_workspace ON public.invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_hired_agents_workspace ON public.hired_agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_connected_sources_workspace ON public.connected_sources(workspace_id);


-- ----------------------------------------------------------------------------
-- 6. RLS on shared resources — workspace members can see all
-- ----------------------------------------------------------------------------

-- DOCUMENTS — shared across the workspace
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can upload their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
DROP POLICY IF EXISTS "Workspace members view documents" ON public.documents;
DROP POLICY IF EXISTS "Workspace members upload documents" ON public.documents;
DROP POLICY IF EXISTS "Document uploaders or admins delete documents" ON public.documents;

CREATE POLICY "Workspace members view documents"
  ON public.documents FOR SELECT
  USING (
    workspace_id IS NOT NULL
      AND public.is_workspace_member(workspace_id)
  );

CREATE POLICY "Workspace members upload documents"
  ON public.documents FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
      AND workspace_id IS NOT NULL
      AND public.is_workspace_member(workspace_id)
  );

CREATE POLICY "Document uploaders or admins delete documents"
  ON public.documents FOR DELETE
  USING (
    auth.uid() = user_id
      OR (workspace_id IS NOT NULL AND public.is_workspace_admin(workspace_id))
  );


-- HIRED AGENTS — shared across the workspace
DROP POLICY IF EXISTS "Users can view their hired agents" ON public.hired_agents;
DROP POLICY IF EXISTS "Users can hire agents" ON public.hired_agents;
DROP POLICY IF EXISTS "Users can update their hired agents" ON public.hired_agents;
DROP POLICY IF EXISTS "Users can delete their hired agents" ON public.hired_agents;
DROP POLICY IF EXISTS "Workspace members view hired agents" ON public.hired_agents;
DROP POLICY IF EXISTS "Workspace members hire agents" ON public.hired_agents;
DROP POLICY IF EXISTS "Workspace members update hired agents" ON public.hired_agents;
DROP POLICY IF EXISTS "Workspace admins delete hired agents" ON public.hired_agents;

CREATE POLICY "Workspace members view hired agents"
  ON public.hired_agents FOR SELECT
  USING (
    workspace_id IS NOT NULL
      AND public.is_workspace_member(workspace_id)
  );

CREATE POLICY "Workspace members hire agents"
  ON public.hired_agents FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
      AND workspace_id IS NOT NULL
      AND public.is_workspace_member(workspace_id)
  );

CREATE POLICY "Workspace members update hired agents"
  ON public.hired_agents FOR UPDATE
  USING (
    workspace_id IS NOT NULL
      AND public.is_workspace_member(workspace_id)
  );

CREATE POLICY "Workspace admins delete hired agents"
  ON public.hired_agents FOR DELETE
  USING (
    workspace_id IS NOT NULL
      AND public.is_workspace_admin(workspace_id)
  );


-- CONNECTED SOURCES — shared across the workspace
DROP POLICY IF EXISTS "Users can view their connected sources" ON public.connected_sources;
DROP POLICY IF EXISTS "Users can add connected sources" ON public.connected_sources;
DROP POLICY IF EXISTS "Users can update their connected sources" ON public.connected_sources;
DROP POLICY IF EXISTS "Users can delete their connected sources" ON public.connected_sources;
DROP POLICY IF EXISTS "Workspace members view sources" ON public.connected_sources;
DROP POLICY IF EXISTS "Workspace members add sources" ON public.connected_sources;
DROP POLICY IF EXISTS "Workspace admins manage sources" ON public.connected_sources;

CREATE POLICY "Workspace members view sources"
  ON public.connected_sources FOR SELECT
  USING (
    workspace_id IS NOT NULL
      AND public.is_workspace_member(workspace_id)
  );

CREATE POLICY "Workspace members add sources"
  ON public.connected_sources FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
      AND workspace_id IS NOT NULL
      AND public.is_workspace_member(workspace_id)
  );

CREATE POLICY "Workspace admins manage sources"
  ON public.connected_sources FOR UPDATE
  USING (
    workspace_id IS NOT NULL
      AND public.is_workspace_admin(workspace_id)
  );


-- INVITATIONS — workspace-scoped
DROP POLICY IF EXISTS "Users can view their own invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Workspace admins view invitations" ON public.invitations;
DROP POLICY IF EXISTS "Workspace admins create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Workspace admins delete invitations" ON public.invitations;

CREATE POLICY "Workspace admins view invitations"
  ON public.invitations FOR SELECT
  USING (
    auth.uid() = invited_by
      OR (workspace_id IS NOT NULL AND public.is_workspace_admin(workspace_id))
  );

CREATE POLICY "Workspace admins create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (
    auth.uid() = invited_by
      AND (workspace_id IS NULL OR public.is_workspace_admin(workspace_id))
  );

CREATE POLICY "Workspace admins delete invitations"
  ON public.invitations FOR DELETE
  USING (
    auth.uid() = invited_by
      OR (workspace_id IS NOT NULL AND public.is_workspace_admin(workspace_id))
  );


-- ----------------------------------------------------------------------------
-- 7. Chat history — per-user but scoped to a workspace
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_threads_user_workspace
  ON public.chat_threads(user_id, workspace_id, updated_at DESC);

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Users create own threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Users update own threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Users delete own threads" ON public.chat_threads;

CREATE POLICY "Users view own threads"
  ON public.chat_threads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own threads"
  ON public.chat_threads FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
      AND public.is_workspace_member(workspace_id)
  );

CREATE POLICY "Users update own threads"
  ON public.chat_threads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own threads"
  ON public.chat_threads FOR DELETE
  USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread
  ON public.chat_messages(thread_id, created_at ASC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users insert own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users delete own messages" ON public.chat_messages;

CREATE POLICY "Users view own messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 8. Helper: get the current user's primary workspace
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_user_workspace_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  SELECT workspace_id INTO v_workspace_id
  FROM public.workspace_members
  WHERE user_id = auth.uid()
  ORDER BY joined_at ASC
  LIMIT 1;
  RETURN v_workspace_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_user_workspace_id() TO authenticated;


-- ----------------------------------------------------------------------------
-- 9. Storage bucket policies — match the new doc-sharing rules
-- ----------------------------------------------------------------------------
-- Documents are uploaded to storage at path: <workspace_id>/<user_id>/<file>
-- This block updates the storage.objects policies if a 'documents' bucket
-- exists. If it doesn't, this is a no-op.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') THEN
    -- Drop legacy per-user policies
    EXECUTE 'DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Workspace members read documents" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Workspace members upload documents" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Workspace members delete documents" ON storage.objects';

    -- New workspace-scoped policies. Path convention:
    -- documents/<workspace_id>/<user_id>/<filename>
    EXECUTE $POLICY$
      CREATE POLICY "Workspace members read documents"
        ON storage.objects FOR SELECT
        USING (
          bucket_id = 'documents'
            AND public.is_workspace_member((storage.foldername(name))[1]::uuid)
        );
    $POLICY$;

    EXECUTE $POLICY$
      CREATE POLICY "Workspace members upload documents"
        ON storage.objects FOR INSERT
        WITH CHECK (
          bucket_id = 'documents'
            AND public.is_workspace_member((storage.foldername(name))[1]::uuid)
        );
    $POLICY$;

    EXECUTE $POLICY$
      CREATE POLICY "Workspace members delete documents"
        ON storage.objects FOR DELETE
        USING (
          bucket_id = 'documents'
            AND public.is_workspace_member((storage.foldername(name))[1]::uuid)
        );
    $POLICY$;
  END IF;
END
$$;
