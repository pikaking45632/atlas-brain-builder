-- 1. Tighten invitations RLS
DROP POLICY IF EXISTS "Anyone can read invitation by code" ON public.invitations;

-- 2. contact_submissions
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

ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS handled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS handled_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Public can submit contact form" ON public.contact_submissions;

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON public.contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_handled
  ON public.contact_submissions(handled, created_at DESC);

-- 3. invite_emails
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

-- 4. Atomic invitation-uses increment
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