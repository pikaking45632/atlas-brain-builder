import { motion } from "framer-motion";
import { Upload, Users, Link2, MessageSquare, ArrowRight, Sparkles, Rocket } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { modules } from "@/data/modules";
import { dashboardThemes } from "@/data/dashboard-themes";
import AtlasLogo from "./AtlasLogo";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
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
      step: 8,
    },
    {
      icon: Users,
      title: "Invite Colleagues",
      description: "Give your entire team the power of Atlas intelligence",
      step: 9,
    },
    {
      icon: Link2,
      title: "Connect Sources",
      description: "Link SharePoint, Notion, Google Drive and more",
      step: 10,
    },
    {
      icon: MessageSquare,
      title: "Start with Atlas",
      description: "Ask your first question and see the magic happen",
      step: 11,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-8 py-5">
        <AtlasLogo />
        <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-semibold">
          {companyName?.[0]?.toUpperCase() || "A"}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl space-y-12">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center space-y-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 14 }}
              className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center mx-auto"
            >
              <Rocket className="w-8 h-8 text-background" />
            </motion.div>

            <h1 className="text-4xl sm:text-[52px] font-display font-bold text-foreground leading-[1.05] tracking-tight">
              {companyName ? `${companyName}'s` : "Your"} AI is<br />
              <span className="text-gradient">ready to go.</span>
            </h1>
            <p className="text-muted-foreground text-[17px] max-w-lg mx-auto leading-relaxed">
              {theme.greeting}. Complete these steps to unlock the full power of Atlas.
            </p>

            <div className="inline-flex items-center gap-2 bg-muted/60 px-4 py-2 rounded-full text-sm text-foreground font-medium">
              <Sparkles className="w-4 h-4" />
              {selectedList.length} modules configured
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {nextSteps.map((ns, i) => {
              const Icon = ns.icon;
              return (
                <motion.button
                  key={ns.title}
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(ns.step)}
                  className="apple-card text-left p-6 group cursor-pointer"
                >
                  <div className="flex flex-col gap-4">
                    <div className="w-11 h-11 rounded-xl bg-foreground flex items-center justify-center">
                      <Icon className="w-5 h-5 text-background" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
                        {ns.title}
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
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
            transition={{ delay: 0.9 }}
            className="text-center space-y-3"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Active modules</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {selectedList.slice(0, 12).map((mod) => {
                const ModIcon = mod.icon;
                return (
                  <div key={mod.id} className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full text-xs font-medium text-foreground">
                    <ModIcon className="w-3 h-3" />
                    {mod.title}
                  </div>
                );
              })}
              {selectedList.length > 12 && (
                <div className="flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground bg-muted/50">
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
