import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/store/onboarding";
import AtlasLogo from "./AtlasLogo";
import AtlasChat from "./AtlasChat";
import { Search, CalendarDays, Settings, Command, ArrowRight, X } from "lucide-react";

const ThemedDashboard = () => {
  const { companyName, setStep } = useOnboarding();
  const [shrunk, setShrunk] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen h-screen flex flex-col bg-background"
    >
      {/* Activation banner — invite team */}
      {!bannerDismissed && (
        <div className="h-10 flex items-center justify-between px-6 bg-amber-soft border-b border-amber-border shrink-0">
          <button
            onClick={() => setStep(10)}
            className="text-[13px] text-foreground hover:text-amber transition-colors inline-flex items-center gap-1.5 group"
          >
            Atlas gets sharper with your team. Invite colleagues
            <ArrowRight className="w-3.5 h-3.5 text-amber transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-text-tertiary hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Nav — solid, dense, shrinks on scroll */}
      <header
        data-shrunk={shrunk}
        className="nav-shell flex items-center justify-between px-6 border-b border-border bg-card shrink-0"
      >
        <div className="flex items-center gap-8">
          <AtlasLogo />
          <nav className="hidden md:flex items-center gap-1 ml-2">
            <a className="nav-pill text-[13px] text-foreground" data-active="true">Chat</a>
            <a className="nav-pill text-[13px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Knowledge</a>
            <a className="nav-pill text-[13px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Sources</a>
            <a className="nav-pill text-[13px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Team</a>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button className="hidden md:flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-background hover:bg-muted text-[12.5px] text-muted-foreground transition-colors">
            <Search className="w-3.5 h-3.5" />
            Search
            <kbd className="kbd ml-2"><Command className="w-2.5 h-2.5 inline -mt-0.5" />K</kbd>
          </button>
          {[CalendarDays, Settings].map((Icon, i) => (
            <button key={i} className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Icon className="w-4 h-4" />
            </button>
          ))}
          <div className="w-px h-5 bg-border mx-1" />
          <div className="w-8 h-8 rounded-md flex items-center justify-center text-[12px] font-semibold text-accent-foreground bg-foreground">
            {companyName?.[0]?.toUpperCase() || "A"}
          </div>
        </div>
      </header>

      {/* Chat fills remaining space */}
      <div className="flex-1 overflow-hidden bg-background">
        <AtlasChat />
      </div>
    </motion.div>
  );
};

export default ThemedDashboard;
