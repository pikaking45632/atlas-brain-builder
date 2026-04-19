import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Copy, Check, Shield } from "lucide-react";
import AtlasLogo from "./AtlasLogo";
import MagneticButton from "./MagneticButton";
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
    toast({ title: "Link copied", description: "Share with your colleagues." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-border">
        <AtlasLogo />
        <button onClick={() => setStep(8)} className="text-[13px] text-muted-foreground hover:text-foreground link-underline">
          Back to dashboard
        </button>
      </header>

      <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-10 py-16 lg:py-20 grid lg:grid-cols-12 gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="lg:col-span-5"
        >
          <span className="eyebrow">ENRICH · TEAM</span>
          <h1 className="mt-4 text-[44px] sm:text-[52px] font-display font-bold text-foreground leading-[1.05] tracking-[-0.03em]">
            Invite<br />your team.
          </h1>
          <p className="mt-5 text-[16px] leading-[1.65] text-muted-foreground max-w-[420px]">
            Share one private link. Atlas only lets people with a matching{" "}
            <span className="text-foreground font-medium">{companyName || "company"}</span>{" "}
            email join.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-muted/40">
            <Shield className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
            <span className="font-mono text-[11px] tracking-[0.04em] text-foreground">
              Domain-locked · 2FA required
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="rounded-[12px] border border-border bg-card p-6">
            <label className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase block mb-2">
              Your invite link
            </label>
            <div className="flex items-stretch gap-2">
              <input
                value={loading ? "Generating link…" : inviteLink}
                readOnly
                className="cinematic-input h-[44px] font-mono text-[12.5px] flex-1"
              />
              <button
                onClick={copyLink}
                disabled={loading}
                className="relative shrink-0 h-[44px] px-4 rounded-md border border-border bg-card hover:bg-muted text-[13px] font-medium text-foreground inline-flex items-center gap-2 transition-colors overflow-hidden"
              >
                <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
                Copy
                <AnimatePresence>
                  {copied && (
                    <motion.span
                      initial={{ x: 32, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 32, opacity: 0 }}
                      transition={{ duration: 0.22, ease }}
                      className="absolute inset-0 inline-flex items-center justify-center gap-1.5 bg-accent text-accent-foreground"
                    >
                      <Check className="w-3.5 h-3.5" /> Copied
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          <div className="rounded-[12px] border border-border bg-card p-6">
            <span className="eyebrow">WHEN THEY OPEN IT</span>
            <ol className="mt-4 space-y-4">
              {[
                "Verify their work email matches your company domain",
                "Enter their job title and key activities",
                "Drop straight into Atlas with your modules pre-loaded",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[13.5px] text-foreground/85">
                  <span className="font-mono text-[11px] text-muted-foreground tabular-nums w-5 shrink-0 mt-[2px]">
                    0{i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={() => setStep(8)} className="btn-ghost h-[48px] px-5 text-[14px] flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <MagneticButton onClick={() => setStep(8)} className="btn-primary h-[48px] px-7 flex items-center gap-2 group">
              Done
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InviteColleagues;
