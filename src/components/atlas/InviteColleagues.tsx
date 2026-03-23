import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Copy, CheckCircle2, ArrowLeft, Link2, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AtlasLogo from "./AtlasLogo";
import { useOnboarding } from "@/store/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const InviteColleagues = () => {
  const { companyName, setStep } = useOnboarding();
  const { toast } = useToast();
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateInvite = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        const emailDomain = user.email.split("@")[1];

        // Check for existing invite
        const { data: existing } = await supabase
          .from("invitations")
          .select("invite_code")
          .eq("invited_by", user.id)
          .limit(1)
          .maybeSingle();

        if (existing) {
          setInviteLink(`${window.location.origin}/join/${existing.invite_code}`);
        } else {
          const { data: newInvite, error } = await supabase
            .from("invitations")
            .insert({
              invited_by: user.id,
              email_domain: emailDomain,
              company_name: companyName || "My Company",
            })
            .select("invite_code")
            .single();

          if (error) throw error;
          setInviteLink(`${window.location.origin}/join/${newInvite.invite_code}`);
        }
      } catch (err) {
        console.error("Error generating invite:", err);
      } finally {
        setLoading(false);
      }
    };

    generateInvite();
  }, [companyName]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({ title: "Link copied!", description: "Share it with your colleagues." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <AtlasLogo />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center mx-auto shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">Invite Your Team</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Share this private link with colleagues. They'll need a matching work email domain to join{" "}
              <span className="font-semibold text-foreground">{companyName || "your workspace"}</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-6"
          >
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <Share2 className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-foreground">
                Only people with a matching <span className="font-semibold">work email domain</span> can sign up through this link. Two-step email verification is required.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your invite link</label>
              <div className="flex gap-2">
                <Input
                  value={loading ? "Generating link..." : inviteLink}
                  readOnly
                  className="font-mono text-sm bg-secondary/50"
                />
                <Button
                  onClick={copyLink}
                  disabled={loading}
                  variant={copied ? "default" : "outline"}
                  className="shrink-0 gap-2"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">When your colleagues click this link, they'll:</p>
              <div className="space-y-2">
                {[
                  "Verify their work email matches your company domain",
                  "Enter their job title and key activities",
                  "Get access to Atlas with your configured modules",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setStep(7)} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={() => setStep(7)}>Done</Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InviteColleagues;
