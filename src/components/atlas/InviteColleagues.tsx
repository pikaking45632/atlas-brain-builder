import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Copy, Check } from "lucide-react";
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
  const [rows, setRows] = useState<{ email: string; role: "Member" | "Admin" }[]>([
    { email: "", role: "Member" },
    { email: "", role: "Member" },
    { email: "", role: "Member" },
  ]);

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

  const updateRow = (idx: number, patch: Partial<{ email: string; role: "Member" | "Admin" }>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const filledCount = rows.filter((r) => r.email.trim()).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-border bg-card">
        <AtlasLogo />
        <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          Step 03 / 03 · Team
        </span>
      </header>

      <div className="flex-1 flex items-start justify-center px-6 py-16 lg:py-24">
        <div className="w-full max-w-[640px]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <h1 className="font-display text-[36px] sm:text-[40px] leading-[1.08] tracking-[-0.02em] text-foreground">
              Atlas works better with your team in it.
            </h1>
            <p className="mt-4 text-[15px] leading-[1.55] text-muted-foreground">
              Each colleague adds knowledge Atlas can connect across.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease }}
            className="mt-8 space-y-3"
          >
            {rows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="email"
                  value={row.email}
                  onChange={(e) => updateRow(idx, { email: e.target.value })}
                  placeholder={idx === 0 ? `colleague@${companyName?.toLowerCase().replace(/\s+/g, "") || "company"}.com` : "Email address"}
                  className="cinematic-input flex-1 h-[44px] text-[14px]"
                />
                <select
                  value={row.role}
                  onChange={(e) => updateRow(idx, { role: e.target.value as "Member" | "Admin" })}
                  className="h-[44px] px-3 pr-8 rounded-md border border-border bg-card text-[13px] text-foreground focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/30 transition-[border-color,box-shadow] duration-150"
                >
                  <option>Member</option>
                  <option>Admin</option>
                </select>
              </div>
            ))}
          </motion.div>

          <div className="mt-8 pt-6 border-t border-border">
            <label className="block text-[13px] text-text-secondary mb-2">
              Or share this invite link
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
                Copy link
                <AnimatePresence>
                  {copied && (
                    <motion.span
                      initial={{ x: 32, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 32, opacity: 0 }}
                      transition={{ duration: 0.18, ease }}
                      className="absolute inset-0 inline-flex items-center justify-center gap-1.5 bg-accent text-accent-foreground"
                    >
                      <Check className="w-3.5 h-3.5" /> Copied
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <p className="mt-2 text-[12px] text-text-tertiary">
              Only people with a matching{" "}
              <span className="font-mono text-text-secondary">@{companyName?.toLowerCase().replace(/\s+/g, "") || "company"}.com</span>{" "}
              email can join.
            </p>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={() => setStep(12)}
              className="text-[13px] text-text-tertiary hover:text-text-secondary transition-colors"
            >
              I'll do this later
            </button>
            <button
              onClick={() => setStep(12)}
              className="btn-amber inline-flex items-center gap-2 group"
            >
              {filledCount > 0 ? `Send ${filledCount} invite${filledCount > 1 ? "s" : ""} and continue` : "Send invites and continue"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InviteColleagues;
