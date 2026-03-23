import { motion } from "framer-motion";
import { Upload, Users, Link2, MessageSquare, CheckCircle2, ArrowRight, Sparkles, Rocket, Zap } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { modules } from "@/data/modules";
import { dashboardThemes } from "@/data/dashboard-themes";
import AtlasLogo from "./AtlasLogo";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 120, damping: 16 } },
};

const Dashboard = () => {
  const { companyName, businessType, selectedModules, setStep } = useOnboarding();
  const selectedList = modules.filter((m) => selectedModules.includes(m.id));
  const theme = dashboardThemes[businessType || "General SME"];

  const nextSteps = [
    {
      icon: Upload,
      title: "Upload Documents",
      description: "Feed your AI with company policies, handbooks and procedures",
      gradient: "from-blue-500 to-cyan-400",
      bgGlow: "bg-blue-500/10",
      step: 8,
    },
    {
      icon: Users,
      title: "Invite Colleagues",
      description: "Give your entire team the power of Atlas intelligence",
      gradient: "from-violet-500 to-purple-400",
      bgGlow: "bg-violet-500/10",
      step: 9,
    },
    {
      icon: Link2,
      title: "Connect Sources",
      description: "Link SharePoint, Notion, Google Drive and more",
      gradient: "from-emerald-500 to-teal-400",
      bgGlow: "bg-emerald-500/10",
      step: 10,
    },
    {
      icon: MessageSquare,
      title: "Start with Atlas",
      description: "Ask your first question and see the magic happen",
      gradient: "from-amber-500 to-orange-400",
      bgGlow: "bg-amber-500/10",
      step: 11,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <AtlasLogo />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            AI Active
          </div>
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            {companyName?.[0]?.toUpperCase() || "A"}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8">
        <div className="w-full max-w-4xl space-y-10">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 80 }}
            className="text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
              className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
            >
              <Rocket className="w-10 h-10 text-primary" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            >
              <Sparkles className="w-4 h-4" />
              {selectedList.length} modules configured
            </motion.div>

            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground leading-tight">
              {companyName ? `${companyName}'s` : "Your"} AI is{" "}
              <span className="text-gradient">ready to go</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {theme.greeting}. Complete these steps to unlock the full power of Atlas.
            </p>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {nextSteps.map((ns, i) => {
              const Icon = ns.icon;
              return (
                <motion.button
                  key={ns.title}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(ns.step)}
                  className={`relative text-left p-6 rounded-2xl bg-card border border-border hover:shadow-[var(--shadow-elevated)] transition-all duration-300 group overflow-hidden`}
                >
                  <div className={`absolute inset-0 ${ns.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ns.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
                        {ns.title}
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{ns.description}</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                    {i + 1}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Active Modules */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium">Active knowledge modules</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {selectedList.slice(0, 12).map((mod) => {
                const ModIcon = mod.icon;
                return (
                  <div key={mod.id} className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-full text-xs font-medium text-foreground">
                    <ModIcon className="w-3 h-3 text-primary" />
                    {mod.title}
                  </div>
                );
              })}
              {selectedList.length > 12 && (
                <div className="flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground bg-secondary">
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
