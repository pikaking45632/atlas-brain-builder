import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface LookupResult {
  ok: true;
  workspace_name: string;
  invitee_email: string;
  role: "member" | "admin";
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
  inviter_name: string;
}

type LookupError =
  | "invitation_not_found"
  | "invitation_already_accepted"
  | "invitation_revoked"
  | "invitation_expired"
  | "invitation_email_mismatch"
  | "lookup_failed";

type Phase =
  | "loading"
  | "needs_signup"
  | "needs_signin_other_email"
  | "ready_to_accept"
  | "accepting"
  | "accepted"
  | "error";

export default function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<Phase>("loading");
  const [lookup, setLookup] = useState<LookupResult | null>(null);
  const [errorKey, setErrorKey] = useState<LookupError | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Token can come from /:code OR a fallback ?token= query param.
  const token = (code ?? searchParams.get("token") ?? "").trim();

  // Step 1: look up the invitation by token (anonymous endpoint).
  useEffect(() => {
    if (!token) {
      setErrorKey("invitation_not_found");
      setPhase("error");
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "invitation-lookup",
          { body: { token } },
        );
        if (cancelled) return;

        if (error || (data as any)?.error) {
          const errKey = ((data as any)?.error ?? "lookup_failed") as LookupError;
          setErrorKey(errKey);
          setErrorMsg(error?.message ?? null);
          setPhase("error");
          return;
        }

        const result = data as LookupResult;
        setLookup(result);

        if (result.status === "accepted") {
          setErrorKey("invitation_already_accepted");
          setPhase("error");
          return;
        }
        if (result.status === "revoked") {
          setErrorKey("invitation_revoked");
          setPhase("error");
          return;
        }
        if (
          result.status === "expired" ||
          new Date(result.expires_at) < new Date()
        ) {
          setErrorKey("invitation_expired");
          setPhase("error");
          return;
        }
      } catch (e) {
        if (cancelled) return;
        setErrorKey("lookup_failed");
        setErrorMsg(e instanceof Error ? e.message : "Unknown error");
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Step 2: once lookup resolves and auth state is known, decide what to do.
  useEffect(() => {
    if (!lookup || authLoading) return;
    if (phase === "error" || phase === "accepted" || phase === "accepting")
      return;

    if (!user) {
      // Not signed in — they need to sign up (or sign in if they already
      // have an account at this email).
      setPhase("needs_signup");
      return;
    }

    // Signed in. Does the email match the invitation?
    if ((user.email ?? "").toLowerCase() !== lookup.invitee_email.toLowerCase()) {
      setPhase("needs_signin_other_email");
      return;
    }

    setPhase("ready_to_accept");
  }, [lookup, user, authLoading, phase]);

  async function handleAccept() {
    setPhase("accepting");
    try {
      const { data, error } = await supabase.functions.invoke(
        "accept-invitation",
        { body: { token } },
      );

      if (error) {
        // Try to extract the specific error from the response body.
        const errKey = ((data as any)?.error ?? null) as LookupError | null;
        if (errKey) {
          setErrorKey(errKey);
        } else {
          setErrorMsg(error.message);
        }
        setPhase("error");
        return;
      }
      if ((data as any)?.error) {
        setErrorKey((data as any).error as LookupError);
        setPhase("error");
        return;
      }

      setPhase("accepted");
      setTimeout(() => navigate("/app", { replace: true }), 1200);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unknown error");
      setPhase("error");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    // Then bounce to sign-up with the token preserved so they come back here.
    navigate(`/sign-up?invitation=${encodeURIComponent(token)}`, {
      replace: true,
    });
  }

  function goToSignUp() {
    // Preserve the token through sign-up so we land back on /join after.
    navigate(
      `/sign-up?invitation=${encodeURIComponent(token)}&email=${encodeURIComponent(
        lookup?.invitee_email ?? "",
      )}`,
      { replace: true },
    );
  }

  function goToSignIn() {
    navigate(
      `/sign-in?invitation=${encodeURIComponent(token)}&email=${encodeURIComponent(
        lookup?.invitee_email ?? "",
      )}`,
      { replace: true },
    );
  }

  // Render -----------------------------------------------------------------
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfaf5] px-6">
      <div className="w-full max-w-md">
        {phase === "loading" && (
          <Card>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-600" />
            <h1 className="mt-4 text-center text-xl font-semibold text-slate-900">
              Looking up your invitation…
            </h1>
          </Card>
        )}

        {phase === "needs_signup" && lookup && (
          <Card>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              You're invited to <span className="text-orange-600">{lookup.workspace_name}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">{lookup.inviter_name}</span>{" "}
              invited <span className="font-medium text-slate-900">{lookup.invitee_email}</span>{" "}
              to join as a <span className="font-medium text-slate-900">{lookup.role}</span>.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button
                onClick={goToSignUp}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Create account & join
              </Button>
              <Button variant="ghost" onClick={goToSignIn}>
                I already have an account
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              Invitation expires{" "}
              {new Date(lookup.expires_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </Card>
        )}

        {phase === "needs_signin_other_email" && lookup && (
          <Card>
            <ShieldAlert className="mx-auto h-8 w-8 text-amber-600" />
            <h1 className="mt-4 text-center text-xl font-semibold text-slate-900">
              Wrong account
            </h1>
            <p className="mt-2 text-center text-sm text-slate-600">
              This invitation was sent to{" "}
              <span className="font-medium text-slate-900">
                {lookup.invitee_email}
              </span>
              , but you're signed in as{" "}
              <span className="font-medium text-slate-900">{user?.email}</span>.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button
                onClick={handleSignOut}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Sign out and try again
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/app", { replace: true })}
              >
                Stay signed in to my account
              </Button>
            </div>
          </Card>
        )}

        {phase === "ready_to_accept" && lookup && (
          <Card>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Join <span className="text-orange-600">{lookup.workspace_name}</span>?
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              You'll join as a{" "}
              <span className="font-medium text-slate-900">{lookup.role}</span>.
            </p>
            <Button
              onClick={handleAccept}
              className="mt-5 w-full bg-orange-600 hover:bg-orange-700"
            >
              Accept invitation
            </Button>
          </Card>
        )}

        {phase === "accepting" && (
          <Card>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-600" />
            <h1 className="mt-4 text-center text-xl font-semibold text-slate-900">
              Joining…
            </h1>
          </Card>
        )}

        {phase === "accepted" && lookup && (
          <Card>
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
            <h1 className="mt-4 text-center text-xl font-semibold text-slate-900">
              Welcome to {lookup.workspace_name}
            </h1>
            <p className="mt-2 text-center text-sm text-slate-600">
              Taking you to your dashboard…
            </p>
          </Card>
        )}

        {phase === "error" && (
          <Card>
            {errorKey === "invitation_expired" ? (
              <Clock className="mx-auto h-8 w-8 text-amber-600" />
            ) : (
              <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
            )}
            <h1 className="mt-4 text-center text-xl font-semibold text-slate-900">
              {errorTitle(errorKey)}
            </h1>
            <p className="mt-2 text-center text-sm text-slate-600">
              {errorBody(errorKey, errorMsg)}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {errorKey === "invitation_email_mismatch" && (
                <Button
                  onClick={handleSignOut}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Sign out and try with the right email
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => navigate("/", { replace: true })}
              >
                Back to home
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      {children}
    </div>
  );
}

function errorTitle(key: LookupError | null): string {
  switch (key) {
    case "invitation_not_found":
      return "Invitation not found";
    case "invitation_already_accepted":
      return "Already accepted";
    case "invitation_revoked":
      return "Invitation revoked";
    case "invitation_expired":
      return "Invitation expired";
    case "invitation_email_mismatch":
      return "Wrong account";
    case "lookup_failed":
    default:
      return "Something went wrong";
  }
}

function errorBody(key: LookupError | null, fallback: string | null): string {
  switch (key) {
    case "invitation_not_found":
      return "This link doesn't match any invitation. Double-check the URL or ask the sender to invite you again.";
    case "invitation_already_accepted":
      return "This invitation has already been used. If you're the recipient, sign in to access your workspace.";
    case "invitation_revoked":
      return "The workspace admin revoked this invitation. Ask them to send a new one if you still need access.";
    case "invitation_expired":
      return "Invitations expire after 7 days. Ask the sender to invite you again.";
    case "invitation_email_mismatch":
      return "This invitation is for a different email address than the one you're signed in with.";
    case "lookup_failed":
    default:
      return fallback ?? "Try refreshing the page. If the problem continues, contact the person who invited you.";
  }
}
