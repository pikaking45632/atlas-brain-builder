import { motion } from "framer-motion";
import { useOnboarding } from "@/store/onboarding";
import { dashboardThemes } from "@/data/dashboard-themes";
import { modules } from "@/data/modules";
import AtlasLogo from "./AtlasLogo";
import { CheckCircle2, MessageSquare, Sparkles, Zap, Send } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 120, damping: 16 } },
};

const ThemedDashboard = () => {
  const { companyName, businessType, selectedModules } = useOnboarding();
  const theme = dashboardThemes[businessType || "General SME"];
  const selectedList = modules.filter((m) => selectedModules.includes(m.id));
  const [query, setQuery] = useState("");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <AtlasLogo />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            AI Active
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            {businessType}
          </div>
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            {companyName?.[0]?.toUpperCase() || "A"}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col px-4 sm:px-8 py-8">
        <div className="w-full max-w-5xl mx-auto space-y-8">
          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              {theme.greeting}
            </h1>
            <p className="text-muted-foreground">
              {companyName ? `${companyName}'s` : "Your"} workspace is configured with {selectedList.length} knowledge modules.
            </p>
          </motion.div>

          {/* Chat input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2"
          >
            <div className="flex-1 relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask Atlas anything about your business..."
                className="pl-10 h-12 bg-card border-border text-base"
              />
            </div>
            <Button className="h-12 px-5 gap-2">
              <Send className="w-4 h-4" />
              Ask
            </Button>
          </motion.div>

          {/* Widget Grid */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {theme.widgets.map((widget) => {
              const Icon = widget.icon;
              const isLarge = widget.size === "large";
              return (
                <motion.div
                  key={widget.title}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`relative p-5 rounded-xl bg-card border border-border hover:shadow-[var(--shadow-elevated)] transition-all cursor-pointer group overflow-hidden ${
                    isLarge ? "sm:col-span-1 lg:col-span-1" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${widget.color} flex items-center justify-center shrink-0 shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-sm font-display font-semibold text-foreground">{widget.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{widget.description}</p>
                    </div>
                  </div>
                  {isLarge && (
                    <div className="mt-4 h-16 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Loading data...</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Active Modules footer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-border">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-medium">Active modules:</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedList.slice(0, 6).map((mod) => (
                <span key={mod.id} className="bg-secondary px-2 py-0.5 rounded text-xs">{mod.title}</span>
              ))}
              {selectedList.length > 6 && (
                <span className="bg-secondary px-2 py-0.5 rounded text-xs">+{selectedList.length - 6} more</span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThemedDashboard;
