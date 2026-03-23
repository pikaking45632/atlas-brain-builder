import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Shield, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AtlasLogo from "@/components/atlas/AtlasLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const JoinPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      if (!code) { setError("Invalid invite link."); setLoading(false); return; }

      const { data, error: fetchError } = await supabase
        .from("invitations")
        .select("company_name, email_domain, uses, max_uses, expires_at")
        .eq("invite_code", code)
        .maybeSingle();

      if (fetchError || !data) {
        setError("This invite link is invalid or has expired.");
      } else if (data.uses >= (data.max_uses || 50)) {
        setError("This invite link has reached its maximum uses.");
      } else if (new Date(data.expires_at) < new Date()) {
        setError("This invite link has expired.");
      } else {
        setInvite({ company_name: data.company_name, email_domain: data.email_domain });
      }
      setLoading(false);
    };
    fetchInvite();
  }, [code]);

  const emailDomainMatches = invite && email.includes("@") && email.split("@")[1] === invite.email_domain;

  const handleSignUp = async () => {
    if (!emailDomainMatches || password.length < 6 || !jobTitle.trim()) return;
    setSubmitting(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        await supabase.from("profiles").insert({
          user_id: authData.user.id,
          company_name: invite!.company_name,
          job_title: jobTitle,
          key_activities: keyActivities,
          email_domain: invite!.email_domain,
          invite_code: code,
        });

        // Increment invite uses
        await supabase.rpc("increment_invite_uses" as any, { invite_code_param: code });
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-display font-bold text-foreground">Invalid Invite</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate("/")}>Go to Atlas</Button>
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center mx-auto shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Join {invite?.company_name}
            </h1>
            <p className="text-muted-foreground">
              Create your Atlas account using your{" "}
              <span className="font-semibold text-foreground">@{invite?.email_domain}</span> work email.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Work email</label>
              <Input
                type="email"
                placeholder={`you@${invite?.email_domain}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {email && !emailDomainMatches && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Email must be @{invite?.email_domain}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Job title *</label>
              <Input
                placeholder="e.g. Operations Manager"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Key activities</label>
              <Input
                placeholder="e.g. Managing schedules, procurement"
                value={keyActivities}
                onChange={(e) => setKeyActivities(e.target.value)}
              />
            </div>

            <Button
              className="w-full gap-2"
              disabled={!emailDomainMatches || password.length < 6 || !jobTitle.trim() || submitting}
              onClick={handleSignUp}
            >
              {submitting ? "Creating account..." : "Create account"}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JoinPage;
