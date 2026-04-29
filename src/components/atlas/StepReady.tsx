import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { useAuth } from "@/components/auth/AuthProvider";
import { getBackendClient } from "@/lib/backend";
import { useToast } from "@/hooks/use-toast";
import { modules } from "@/data/modules";
import AtlasLogo from "./AtlasLogo";
import DrawCheck from "./DrawCheck";
import MagneticButton from "./MagneticButton";
import { useNavigate } from "react-router-dom";

const ease = [0.16, 1, 0.3, 1] as const;

const StepReady = () => {
  const {
    companyName,
    industry,
    teamSize,
    country,
    plan,
    businessType,
    selectedModules,
    hasUploadedDocuments,
    invitesSentCount,
    reset,
  } = useOnboarding();
  const { user, workspace, refreshWorkspace } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const selectedList = modules.filter((m) => selectedModules.includes(m.id));

  const handleOpen = async () => {
    if (creating) return;

    // If they already have a workspace (e.g. they came back through
    // onboarding by accident), just go straight in.
    if (workspace) {
      reset();
      navigate("/app");
      return;
    }

    if (!user) {
      navigate("/sign-up");
      return;
    }

    setCreating(true);
    try {
      const client = getBackendClient();
      if (!client) throw new Error("Backend unavailable");

      const { data, error } = await client.functions.invoke("create-workspace", {
        body: {
          name: companyName?.trim() || "My Workspace",
          industry,
          team_size: teamSize,
          country,
          business_type: businessType || undefined,
          selected_modules: selectedModules,
          plan: plan || "trial",
        },
      });

      if (error) throw new Error(error.message || "Could not create workspace");
      if (data && (data as any).error) throw new Error((data as any).error);

      // Refresh the auth provider so it picks up the new workspace.
      await refreshWorkspace();

      toast({
        title: "Workspace ready",
        description: `${companyName || "Your"} Atlas is live.`,
      });

      reset();
      navigate("/app");
    } catch (err: any) {
      toast({
        title: "Couldn't open workspace",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-border">
        <AtlasLogo />
        <span className="font-mono text-[11px] tracking-[0.12em] text-text-tertiary uppercase">
          Setup complete
        </span>
      </header>

      <div className="flex-1 max-w-[920px] mx-auto w-full px-6 md:px-10 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-9 h-9 rounded-full bg-success flex items-center justify-center">
              <DrawCheck size={18} colorClass="text-success-foreground" stroke={2.5} delay={0.1} duration={0.4} />
            </span>
            <span className="eyebrow">YOU'RE LIVE</span>
          </div>

          <h1 className="font-display font-semibold leading-[1.04] tracking-[-0.022em] text-foreground">
            {companyName ? `${companyName}'s` : "Your"} Atlas<br />
            <span className="text-text-secondary">is ready to answer questions.</span>
          </h1>

          <p className="mt-6 text-[16px] leading-[1.65] text-text-secondary max-w-[560px]">
            {businessType ? `As a ${businessType.toLowerCase()} workspace, ` : ""}
            you've configured <span className="text-foreground font-medium">{selectedList.length} specialist agents</span>
            {hasUploadedDocuments ? <>, uploaded your first knowledge documents</> : null}
            {invitesSentCount > 0 ? <>, and invited <span className="text-foreground font-medium">{invitesSentCount} colleague{invitesSentCount > 1 ? "s" : ""}</span></> : null}.
            {" "}
            Let's get to work.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <MagneticButton
              onClick={handleOpen}
              disabled={creating}
              className="btn-amber h-[52px] px-7 flex items-center gap-2 group disabled:opacity-60"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Opening Atlas…
                </>
              ) : (
                <>
                  Open Atlas
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </MagneticButton>
            <span className="hidden sm:inline font-mono text-[11px] tracking-[0.14em] text-text-tertiary">
              ⌘ + ⏎
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StepReady;
