import { motion } from "framer-motion";
import { useOnboarding } from "@/store/onboarding";
import AtlasLogo from "./AtlasLogo";
import AtlasChat from "./AtlasChat";
import { Users, CalendarDays, Settings } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const ThemedDashboard = () => {
  const { companyName } = useOnboarding();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen h-screen flex flex-col"
    >
      {/* Top Nav */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border/20 shrink-0">
        <AtlasLogo />
        <div className="flex items-center gap-1">
          {[Users, CalendarDays, Settings].map((Icon, i) => (
            <button key={i} className="p-2.5 rounded-xl hover:bg-muted/30 transition-all duration-300 text-muted-foreground hover:text-foreground">
              <Icon className="w-4 h-4" />
            </button>
          ))}
          <div className="w-px h-5 bg-border/30 mx-1" />
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            {companyName?.[0]?.toUpperCase() || "A"}
          </div>
        </div>
      </header>

      {/* Chat fills remaining space */}
      <div className="flex-1 overflow-hidden">
        <AtlasChat />
      </div>
    </motion.div>
  );
};

export default ThemedDashboard;
