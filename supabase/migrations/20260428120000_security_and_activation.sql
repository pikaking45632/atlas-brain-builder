-- ============================================================================
-- Atlas — Security hardening + activation infrastructure
-- ============================================================================
-- Idempotent migration. Safe to run even if some tables already exist
-- from previous direct-SQL changes in the Supabase dashboard.
--
-- 1. Drops the dangerous "Anyone can read invitation by code" policy that let
--    any anon-key holder dump every customer's invitations.
-- 2. Ensures contact_submissions table exists for the Contact Sales form
--    (matches the schema the submit-contact Edge Function already writes to).
-- 3. Ensures invite_emails table exists for InviteColleagues persistence
--    (matches the schema the send-invites Edge Function already writes to).
-- 4. Adds an atomic increment helper for invitation uses.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Tighten invitations RLS
-- ----------------------------------------------------------------------------
-- Public lookup now goes through the invitation-lookup Edge Function which
-- uses service_role to query the table without exposing it to anon clients.

DROP POLICY IF EXISTS "Anyone can read invitation by code" ON public.invitations;

-- (The "Users can view their own invitations" policy from the original
--  migration is preserved — invite owners can still read their own rows.)


-- ----------------------------------------------------------------------------
-- 2. contact_submissions table
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  team_size TEXT,
  message TEXT,
  source TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  handled BOOLEAN NOT NULL DEFAULT false,
  handled_at TIMESTAMP WITH TIME ZONE
);

-- Defensive: add columns if the table already existed without them.
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS handled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS handled_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies before recreating, so this migration is replayable.
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Public can submit contact form" ON public.contact_submissions;

-- The Edge Function uses service_role and bypasses RLS entirely.
-- We deliberately do NOT add a SELECT policy — submissions are private,
-- viewable only via the Supabase dashboard / admin tooling.
-- Inserts are also blocked at the RLS layer (no INSERT policy = no anon
-- inserts), forcing all submissions through the Edge Function which can
-- spam-filter and rate-limit.

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON public.contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_handled
  ON public.contact_submissions(handled, created_at DESC);


-- ----------------------------------------------------------------------------
-- 3. invite_emails table (persists per-recipient invite rows)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.invite_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Member' CHECK (role IN ('Member', 'Admin')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'accepted')),
  sent_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT invite_emails_invitation_recipient_unique
    UNIQUE (invitation_id, recipient_email)
);

ALTER TABLE public.invite_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own invite emails" ON public.invite_emails;
DROP POLICY IF EXISTS "Users create own invite emails" ON public.invite_emails;
DROP POLICY IF EXISTS "Users delete own invite emails" ON public.invite_emails;

-- Owners can see and manage their own invite recipients. Inserts/updates
-- happen through the Edge Function (service_role), but we add the SELECT
-- policy so a future "manage invitations" UI can list rows.
CREATE POLICY "Users view own invite emails"
  ON public.invite_emails FOR SELECT
  USING (auth.uid() = invited_by);

CREATE POLICY "Users delete own invite emails"
  ON public.invite_emails FOR DELETE
  USING (auth.uid() = invited_by);

CREATE INDEX IF NOT EXISTS idx_invite_emails_invited_by
  ON public.invite_emails(invited_by);

CREATE INDEX IF NOT EXISTS idx_invite_emails_invitation_id
  ON public.invite_emails(invitation_id);


-- ----------------------------------------------------------------------------
-- 4. Atomic invitation-uses increment
-- ----------------------------------------------------------------------------
-- Called from JoinPage after a successful sign-up. SECURITY DEFINER so it
-- bypasses RLS to update the invitations row safely.

CREATE OR REPLACE FUNCTION public.increment_invitation_uses(p_invite_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.invitations
  SET uses = uses + 1
  WHERE invite_code = p_invite_code
    AND uses < COALESCE(max_uses, 50)
    AND (expires_at IS NULL OR expires_at > now());
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_invitation_uses(TEXT) TO anon, authenticated;
