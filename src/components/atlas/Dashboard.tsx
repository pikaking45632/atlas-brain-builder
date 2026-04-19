import { motion } from "framer-motion";
import { Upload, Users, Link2, MessageSquare, ArrowRight } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { modules } from "@/data/modules";
import { dashboardThemes } from "@/data/dashboard-themes";
import AtlasLogo from "./AtlasLogo";
import DrawCheck from "./DrawCheck";
import MagneticButton from "./MagneticButton";
import SpotlightCard from "./SpotlightCard";

const ease = [0.16, 1, 0.3, 1] as const;

const Dashboard = () => {
  const { companyName, businessType, selectedModules, setStep } = useOnboarding();
  const selectedList = modules.filter((m) => selectedModules.includes(m.id));
  const theme = dashboardThemes[businessType || "General SME"];

  const nextSteps = [
    { icon: Upload,          title: "Upload documents",  description: "Feed Atlas with your handbooks and policies.", step: 9  },
    { icon: Users,           title: "Invite your team",  description: "Share a private link gated to your domain.",   step: 10 },
    { icon: Link2,           title: "Connect sources",   description: "Wire in Slack, Drive, Xero — anything.",       step: 11 },
    { icon: MessageSquare,   title: "Open Atlas chat",   description: "Skip the rest and start asking questions.",    step: 12 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-border">
        <AtlasLogo />
        <div className="w-9 h-9 rounded-md flex items-center justify-center text-[12px] font-semibold text-accent-foreground bg-foreground">
          {companyName?.[0]?.toUpperCase() || "A"}
        </div>
      </header>

      <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-10 py-16 lg:py-24">
        {/* Setup complete moment */}
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="lg:col-span-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                <DrawCheck size={18} colorClass="text-accent-foreground" stroke={2.5} delay={0.1} duration={0.4} />
              </span>
              <span className="eyebrow">SETUP COMPLETE</span>
            </div>
            <h1 className="text-[56px] sm:text-[72px] font-display font-bold text-foreground leading-[1.02] tracking-[-0.04em]">
              {companyName ? `${companyName}'s` : "Your"} Atlas<br />
              is <span className="text-gradient">ready</span>.
            </h1>
            <p className="mt-6 text-[17px] leading-[1.6] text-muted-foreground max-w-[480px]">
              {theme.greeting}. Your workspace is provisioned and{" "}
              <span className="text-foreground">{selectedList.length} specialist agents</span>{" "}
              are loaded. Welcome in.
            </p>

            <div className="mt-10 flex items-center gap-3">
              <MagneticButton
                onClick={() => setStep(12)}
                className="btn-primary h-[52px] px-7 flex items-center gap-2 group"
              >
                Open Atlas
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </MagneticButton>
              <span className="hidden sm:inline font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
                ⌘ + ⏎
              </span>
            </div>
            <p className="mt-3 text-[13px] text-muted-foreground">
              Your workspace is ready. Welcome in.
            </p>
          </motion.div>

          {/* Mono summary block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease }}
            className="lg:col-span-4"
          >
            <div className="rounded-[12px] border border-border bg-card p-6">
              <span className="eyebrow">DEPLOYMENT</span>
              <div className="mt-4 space-y-3">
                {[
                  ["Workspace",      companyName || "Atlas"],
                  ["Industry",       businessType || "—"],
                  ["Modules",        String(selectedList.length)],
                  ["Agents online",  String(Math.min(selectedList.length, 10))],
                  ["Region",         "EU-WEST-1"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-[12.5px]">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-mono text-foreground">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground inline-flex items-center gap-2">
                  <span className="pulse-dot pulse-dot--sm" />
                  ALL SYSTEMS ONLINE
                </span>
                <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                  v1.0
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Optional next steps — small, secondary */}
        <div className="mt-24">
          <div className="flex items-baseline justify-between mb-5">
            <span className="eyebrow">OPTIONAL · ENRICH YOUR MODEL</span>
            <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground hidden md:inline">
              SKIP ANYTIME
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {nextSteps.map((ns, i) => {
              const Icon = ns.icon;
              return (
                <motion.div
                  key={ns.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease }}
                >
                  <SpotlightCard
                    onClick={() => setStep(ns.step)}
                    className="cursor-pointer corners corners-subtle p-5 rounded-[12px] border border-border bg-card hover:border-foreground/20 hover:shadow-card-hover hover:-translate-y-[2px] transition-all duration-200 group h-full"
                  >
                    <span className="corner-tr" />
                    <span className="corner-bl" />
                    <Icon className="w-[18px] h-[18px] text-foreground/60 group-hover:text-accent transition-colors" strokeWidth={1.5} />
                    <h3 className="mt-3 text-[14px] font-semibold text-foreground flex items-center gap-2">
                      {ns.title}
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                    </h3>
                    <p className="mt-1 text-[12.5px] text-muted-foreground leading-[1.45]">
                      {ns.description}
                    </p>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
