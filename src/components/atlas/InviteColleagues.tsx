import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Copy, Check, Loader2 } from "lucide-react";
import AtlasLogo from "./AtlasLogo";
import { useOnboarding } from "@/store/onboarding";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { getBackendClient } from "@/lib/backend";
import { ensureWorkspace } from "@/lib/workspace";

const ease = [0.16, 1, 0.3, 1] as const;

const isValidEmail = (e: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()) && e.trim().length < 255;

const InviteColleagues = () => {
  const { setStep, setInvitesSent, invitesSentCount, ...onboarding } = useOnboarding();
  const { user, workspace, refreshWorkspace } = useAuth();
  const { toast } = useToast();

  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [rows, setRows] = useState<{ email: string; role: "Member" | "Admin" }[]>([
    { email: "", role: "Member" },
    { email: "", role: "Member" },
    { email: "", role: "Member" },
  ]);

  const companyName = workspace?.name || onboarding.companyName || "your team";
  const emailDomainHint = workspace?.email_domain
    || (onboarding.companyName ? `${onboarding.companyName.toLowerCase().replace(/\s+/g, "")}.com` : "company.com");

  // Generate or fetch the invite link for this workspace.
  useEffect(() => {
    const generateInvite = async () => {
      const client = getBackendClient();
      try {
        if (!client) { setInviteLink("Backend unavailable in this preview"); return; }
        if (!user) { setInviteLink("Sign in to generate an invite link"); return; }

        // Ensure a workspace exists before we try to scope an invitation to it.
        const ws = workspace || await ensureWorkspace(client, {
          name: onboarding.companyName || "My Workspace",
          industry: onboarding.industry,
          team_size: onboarding.teamSize,
          country: onboarding.country,
          business_type: onboarding.businessType || undefined,
          selected_modules: onboarding.selectedModules,
          plan: onboarding.plan || "trial",
        });
        if (!ws) return;
        if (!workspace) await refreshWorkspace();

        const emailDomain = (user.email || "").split("@")[1] || "team.atlas";

        // Find or create the workspace's master invitation row.
        const { data: existing } = await client
          .from("invitations")
          .select("invite_code")
          .eq("workspace_id", ws.id)
          .limit(1)
          .maybeSingle();

        if (existing) {
          setInviteLink(`${window.location.origin}/join/${existing.invite_code}`);
        } else {
          const { data: newInvite, error } = await client
            .from("invitations")
            .insert({
              workspace_id: ws.id,
              invited_by: user.id,
              email_domain: emailDomain,
              company_name: onboarding.companyName || "My Company",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, workspace?.id]);

  const copyLink = async () => {
    if (!inviteLink || inviteLink.includes("unavailable") || inviteLink.includes("Sign in")) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({ title: "Link copied", description: "Share with your colleagues." });
    setTimeout(() => setCopied(false), 2000);
  };

  const updateRow = (idx: number, patch: Partial<{ email: string; role: "Member" | "Admin" }>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const validRows = rows.filter((r) => isValidEmail(r.email));
  const filledCount = validRows.length;
  const returnTo = sessionStorage.getItem("invite_return_to");

  const handleSend = async () => {
    if (sending) return;
    setSending(true);

    try {
      const client = getBackendClient();
      if (!client) {
        toast({ title: "Backend unavailable", variant: "destructive" });
        return;
      }

      if (filledCount > 0) {
        const { data, error } = await client.functions.invoke("send-invites", {
          body: {
            invitations: validRows.map((r) => ({
              email: r.email.trim().toLowerCase(),
              role: r.role,
            })),
            origin: window.location.origin,
          },
        });

        if (error) throw new Error(error.message || "Could not send invites");
        if (data && (data as any).error) throw new Error((data as any).error);

        const sent = (data as any)?.sent ?? filledCount;
        const failed = (data as any)?.failed ?? 0;

        setInvitesSent(invitesSentCount + sent);

        if (failed > 0) {
          toast({ title: `${sent} sent, ${failed} failed`, description: "Check console for details." });
        } else {
          toast({
            title: `${sent} invite${sent > 1 ? "s" : ""} sent`,
            description: "Your colleagues will receive a join link.",
          });
        }
      }

      if (returnTo) {
        sessionStorage.removeItem("invite_return_to");
        window.location.href = returnTo;
        return;
      }

      setStep(10);
    } catch (err: any) {
      toast({
        title: "Couldn't send invites",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const skip = () => {
    if (returnTo) {
      sessionStorage.removeItem("invite_return_to");
      window.location.href = returnTo;
      return;
    }
    setStep(10);
  };

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
        <span className="font-mono text-[11px] tracking-[0.12em] text-text-tertiary uppercase">
          Step 02 / 03 · Team
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
            <p className="mt-4 text-[15px] leading-[1.55] text-text-secondary">
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
                  placeholder={idx === 0 ? `colleague@${emailDomainHint}` : "Email address"}
                  className="cinematic-input flex-1 h-[44px] text-[14px]"
                />
                <select
                  value={row.role}
                  onChange={(e) => updateRow(idx, { role: e.target.value as "Member" | "Admin" })}
                  className="h-[44px] px-3 pr-8 rounded-md border border-border bg-card text-[13px] text-foreground focus:outline-none focus:border-amber focus:ring-[3px] focus:ring-amber/30 transition-[border-color,box-shadow] duration-150"
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
                      className="absolute inset-0 inline-flex items-center justify-center gap-1.5 bg-foreground text-background"
                    >
                      <Check className="w-3.5 h-3.5" /> Copied
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <p className="mt-2 text-[12px] text-text-tertiary">
              Only people with a matching{" "}
              <span className="font-mono text-text-secondary">@{emailDomainHint}</span>{" "}
              email can join {companyName}.
            </p>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={skip}
              className="text-[13px] text-text-tertiary hover:text-text-secondary transition-colors"
            >
              I'll do this later
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="btn-amber inline-flex items-center gap-2 group disabled:opacity-60"
            >
              {sending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  {filledCount > 0 ? `Send ${filledCount} invite${filledCount > 1 ? "s" : ""} and continue` : "Continue without inviting"}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InviteColleagues;
