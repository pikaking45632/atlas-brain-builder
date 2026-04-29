import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Shield, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import AtlasLogo from "@/components/atlas/AtlasLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getBackendClient } from "@/lib/backend";
import { useAuth } from "@/components/auth/AuthProvider";

const JoinPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshWorkspace } = useAuth();

  const [invite, setInvite] = useState<{ company_name: string; email_domain: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [keyActivities, setKeyActivities] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      const client = getBackendClient();
      if (!code) { setError("Invalid invite link."); setLoading(false); return; }
      if (!client) { setError("Backend is unavailable in this preview."); setLoading(false); return; }

      try {
        const { data, error: fnError } = await client.functions.invoke("invitation-lookup", { body: { code } });
        if (fnError) throw new Error(fnError.message || "Lookup failed");
        if (data && (data as any).error) {
          setError((data as any).error);
        } else if (data && (data as any).invitation) {
          setInvite({
            company_name: (data as any).invitation.company_name,
            email_domain: (data as any).invitation.email_domain,
          });
        } else {
          setError("This invite link is invalid or has expired.");
        }
      } catch (err: any) {
        setError(err?.message || "Could not look up this invitation.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [code]);

  const emailDomainMatches =
    invite && email.includes("@") && email.split("@")[1] === invite.email_domain;

  const handleSignUp = async () => {
    const client = getBackendClient();
    if (!client || !emailDomainMatches || password.length < 6 || !jobTitle.trim() || !code) return;
    setSubmitting(true);

    try {
      // 1. Create the auth user
      const { data: authData, error: signUpError } = await client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/app` },
      });
      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Sign-up did not return a user");

      // 2. Wait for the session to be live (signUp returns a session
      // immediately when email confirmation is OFF in Supabase settings).
      // If confirmation is ON, the user has to verify before continuing.
      const { data: { session } } = await client.auth.getSession();
      if (!session) {
        toast({
          title: "Account created",
          description: "Check your email to verify, then come back to this link.",
        });
        return;
      }

      // 3. Call the secure accept-invitation Edge Function which adds the
      // user to the workspace and increments uses atomically.
      const { data: acceptData, error: acceptError } = await client.functions.invoke("accept-invitation", {
        body: {
          code,
          job_title: jobTitle,
          key_activities: keyActivities,
        },
      });
      if (acceptError) throw new Error(acceptError.message);
      if (acceptData && (acceptData as any).error) throw new Error((acceptData as any).error);

      // 4. Refresh the auth context so the workspace is loaded.
      await refreshWorkspace();

      toast({
        title: `Welcome to ${invite?.company_name}`,
        description: "Taking you to your workspace…",
      });

      navigate("/app", { replace: true });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-text-secondary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-[24px] font-display font-semibold text-foreground tracking-[-0.015em]">Invalid invite</h1>
          <p className="text-[14px] text-text-secondary">{error}</p>
          <Button onClick={() => navigate("/")} className="btn-primary">Go to Atlas</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <AtlasLogo />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-background" strokeWidth={1.75} />
            </div>
            <h1 className="text-[28px] font-display font-semibold text-foreground tracking-[-0.018em] leading-[1.1]">
              Join {invite?.company_name}
            </h1>
            <p className="text-[14px] text-text-secondary">
              Create your Atlas account using your{" "}
              <span className="font-mono text-foreground">@{invite?.email_domain}</span> work email.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[12.5px] font-medium text-text-secondary">Work email</label>
              <Input
                type="email"
                placeholder={`you@${invite?.email_domain}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {email && !emailDomainMatches && (
                <p className="text-[11.5px] text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Email must be @{invite?.email_domain}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[12.5px] font-medium text-text-secondary">Password</label>
              <Input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[12.5px] font-medium text-text-secondary">Job title</label>
              <Input
                placeholder="e.g. Operations Manager"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[12.5px] font-medium text-text-secondary">Key activities</label>
              <Input
                placeholder="e.g. Managing schedules, procurement"
                value={keyActivities}
                onChange={(e) => setKeyActivities(e.target.value)}
              />
            </div>

            <Button
              className="w-full gap-2 btn-amber"
              disabled={!emailDomainMatches || password.length < 6 || !jobTitle.trim() || submitting}
              onClick={handleSignUp}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Join {invite?.company_name}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JoinPage;
