import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Copy, CheckCircle2, ArrowLeft, Share2 } from "lucide-react";
import AtlasLogo from "./AtlasLogo";
import { useOnboarding } from "@/store/onboarding";
import { useToast } from "@/hooks/use-toast";
import { getBackendClient } from "@/lib/backend";

const ease = [0.16, 1, 0.3, 1] as const;

const InviteColleagues = () => {
  const { companyName, setStep } = useOnboarding();
  const { toast } = useToast();
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateInvite = async () => {
      const client = getBackendClient();
      try {
        if (!client) { setInviteLink("Backend unavailable in this preview"); return; }
        const { data: { user } } = await client.auth.getUser();
        if (!user?.email) return;
        const emailDomain = user.email.split("@")[1];
        const { data: existing } = await client.from("invitations").select("invite_code").eq("invited_by", user.id).limit(1).maybeSingle();
        if (existing) {
          setInviteLink(`${window.location.origin}/join/${existing.invite_code}`);
        } else {
          const { data: newInvite, error } = await client.from("invitations").insert({ invited_by: user.id, email_domain: emailDomain, company_name: companyName || "My Company" }).select("invite_code").single();
          if (error) throw error;
          setInviteLink(`${window.location.origin}/join/${newInvite.invite_code}`);
        }
      } catch (err) { console.error("Error generating invite:", err); } finally { setLoading(false); }
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
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.5, ease }}
      className="min-h-screen flex flex-col"
    >
      <header className="flex items-center px-8 py-6">
        <AtlasLogo />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }} className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mx-auto shadow-[0_0_40px_-8px_hsl(270_70%_60%/0.4)]">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">Invite Your Team</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Share this private link with colleagues. They'll need a matching work email to join{" "}
              <span className="font-semibold text-foreground">{companyName || "your workspace"}</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease }}
            className="glass-card p-6 space-y-6"
          >
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <Share2 className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-foreground/80">
                Only people with a matching <span className="font-semibold text-foreground">work email domain</span> can sign up. Two-step verification required.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your invite link</label>
              <div className="flex gap-2">
                <input
                  value={loading ? "Generating link..." : inviteLink}
                  readOnly
                  className="cinematic-input h-[44px] px-4 rounded-xl font-mono text-sm flex-1"
                />
                <button
                  onClick={copyLink}
                  disabled={loading}
                  className={`shrink-0 h-[44px] px-4 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                    copied
                      ? "bg-success text-white"
                      : "btn-ghost"
                  }`}
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">When your colleagues click this link:</p>
              <div className="space-y-2">
                {[
                  "Verify their work email matches your company domain",
                  "Enter their job title and key activities",
                  "Get access to Atlas with your configured modules",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white"
                      style={{ background: "var(--gradient-primary)" }}
                    >{i + 1}</div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(8)} className="btn-ghost h-[48px] px-6 text-sm flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setStep(8)} className="btn-primary h-[48px] px-8 text-sm">Done</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InviteColleagues;
