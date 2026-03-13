import { motion } from "framer-motion";
import { Upload, Users, Link2, MessageSquare, CheckCircle2, Brain, ArrowRight } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { modules } from "@/data/modules";
import AtlasLogo from "./AtlasLogo";

const nextSteps = [
  { icon: Upload, title: "Upload company documents", description: "Feed your AI with policies, handbooks and procedures", color: "text-primary" },
  { icon: Users, title: "Invite team members", description: "Give your team access to Atlas", color: "text-primary" },
  { icon: Link2, title: "Connect data sources", description: "Link tools like SharePoint, Notion or Google Drive", color: "text-primary" },
  { icon: MessageSquare, title: "Start asking Atlas questions", description: "Test your AI with real workplace queries", color: "text-primary" },
];

const Dashboard = () => {
  const { companyName, selectedModules } = useOnboarding();
  const selectedList = modules.filter((m) => selectedModules.includes(m.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col"
    >
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <AtlasLogo />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {companyName?.[0]?.toUpperCase() || "A"}
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 sm:px-8 py-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome to Atlas{companyName ? `, ${companyName}` : ""}
          </h1>
          <p className="text-muted-foreground">Your workplace AI is ready. Here's what's next.</p>
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-primary/30 bg-primary/5 p-6 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">AI Model Ready</h3>
              <div className="flex items-center gap-1 bg-success/20 text-success px-2 py-0.5 rounded-full text-[10px] font-semibold">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Active
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedList.length} knowledge modules configured and ready to use
            </p>
          </div>
        </motion.div>

        {/* Modules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-foreground">Active knowledge modules</h3>
          <div className="flex flex-wrap gap-2">
            {selectedList.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="flex items-center gap-1.5 bg-card border border-border px-3 py-2 rounded-xl text-xs font-medium text-foreground"
                >
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {mod.title}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-foreground">Suggested next steps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nextSteps.map((step) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.title}
                  className="text-left p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-card-hover transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                        {step.title}
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
