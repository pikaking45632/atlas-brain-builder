import { motion } from "framer-motion";
import { Upload, Users, Link2, MessageSquare, ArrowRight, Sparkles, Rocket } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { modules } from "@/data/modules";
import { dashboardThemes } from "@/data/dashboard-themes";
import AtlasLogo from "./AtlasLogo";

const ease = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.4 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const Dashboard = () => {
  const { companyName, businessType, selectedModules, setStep } = useOnboarding();
  const selectedList = modules.filter((m) => selectedModules.includes(m.id));
  const theme = dashboardThemes[businessType || "General SME"];

  const nextSteps = [
    {
      icon: Upload,
      title: "Upload Documents",
      description: "Feed your AI with company knowledge",
      step: 8,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Invite Colleagues",
      description: "Give your team Atlas intelligence",
      step: 9,
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Link2,
      title: "Connect Sources",
      description: "Link your existing tools and data",
      step: 10,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: MessageSquare,
      title: "Start with Atlas",
      description: "Ask your first question",
      step: 11,
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col"
    >
      <header className="flex items-center justify-between px-8 py-6">
        <AtlasLogo />
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          {companyName?.[0]?.toUpperCase() || "A"}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl space-y-14">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 14 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_40px_-8px_hsl(var(--primary)/0.4)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Rocket className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-[44px] sm:text-[56px] font-display font-bold text-foreground leading-[1.02] tracking-tighter">
              {companyName ? `${companyName}'s` : "Your"} AI is<br />
              <span className="text-gradient">ready to go.</span>
            </h1>
            <p className="text-muted-foreground text-[17px] max-w-lg mx-auto leading-relaxed">
              {theme.greeting}. Complete these steps to unlock the full power of Atlas.
            </p>

            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm text-foreground font-medium">
              <Sparkles className="w-4 h-4 text-primary" />
              {selectedList.length} modules configured
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {nextSteps.map((ns) => {
              const Icon = ns.icon;
              return (
                <motion.button
                  key={ns.title}
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(ns.step)}
                  className="glass-card text-left p-6 group cursor-pointer"
                >
                  <div className="flex flex-col gap-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ns.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
                        {ns.title}
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{ns.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Modules */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center space-y-3"
          >
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">Active modules</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {selectedList.slice(0, 12).map((mod) => {
                const ModIcon = mod.icon;
                return (
                  <div key={mod.id} className="flex items-center gap-1.5 bg-muted/30 border border-border/20 px-3 py-1.5 rounded-full text-xs font-medium text-foreground/70">
                    <ModIcon className="w-3 h-3 text-primary" />
                    {mod.title}
                  </div>
                );
              })}
              {selectedList.length > 12 && (
                <div className="flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground bg-muted/30 border border-border/20">
                  +{selectedList.length - 12} more
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
