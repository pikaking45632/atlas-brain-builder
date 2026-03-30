import { motion } from "framer-motion";
import { useOnboarding } from "@/store/onboarding";
import AtlasLogo from "./AtlasLogo";
import { Send, Users, CalendarDays, Settings } from "lucide-react";
import { useState } from "react";

const ease = [0.16, 1, 0.3, 1];

const suggestions = [
  "Give me a full company briefing",
  "What are the highest priority items?",
  "Who's on holiday right now?",
  "What did I miss this week?",
  "What are my upcoming deadlines?",
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const ThemedDashboard = () => {
  const { companyName } = useOnboarding();
  const [query, setQuery] = useState("");
  const displayName = companyName || "there";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col"
    >
      {/* Top Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/20">
        <AtlasLogo />
        <div className="flex items-center gap-1">
          {[Users, CalendarDays, Settings].map((Icon, i) => (
            <button key={i} className="p-2.5 rounded-xl hover:bg-muted/30 transition-all duration-300 text-muted-foreground hover:text-foreground">
              <Icon className="w-4 h-4" />
            </button>
          ))}
          <div className="w-px h-5 bg-border/30 mx-1" />
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            {companyName?.[0]?.toUpperCase() || "A"}
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
        {/* Sphere */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease }}
          className="mb-10"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-3xl opacity-20" style={{ background: "var(--gradient-primary)" }} />
            <svg width="180" height="180" viewBox="0 0 400 400" fill="none" className="opacity-20 relative">
              <circle cx="200" cy="200" r="160" stroke="hsl(var(--primary))" strokeWidth="0.8" fill="none" />
              <ellipse cx="200" cy="200" rx="160" ry="60" stroke="hsl(var(--primary))" strokeWidth="0.5" fill="none" />
              <ellipse cx="200" cy="200" rx="160" ry="60" stroke="hsl(var(--primary))" strokeWidth="0.5" fill="none" transform="rotate(60 200 200)" />
              <ellipse cx="200" cy="200" rx="160" ry="60" stroke="hsl(var(--primary))" strokeWidth="0.5" fill="none" transform="rotate(120 200 200)" />
              <ellipse cx="200" cy="200" rx="60" ry="160" stroke="hsl(var(--primary))" strokeWidth="0.5" fill="none" />
              <ellipse cx="200" cy="200" rx="60" ry="160" stroke="hsl(var(--primary))" strokeWidth="0.5" fill="none" transform="rotate(60 200 200)" />
              <ellipse cx="200" cy="200" rx="60" ry="160" stroke="hsl(var(--primary))" strokeWidth="0.5" fill="none" transform="rotate(120 200 200)" />
              <circle cx="200" cy="200" r="110" stroke="hsl(var(--primary))" strokeWidth="0.3" fill="none" />
              <circle cx="200" cy="200" r="60" stroke="hsl(var(--primary))" strokeWidth="0.3" fill="none" />
            </svg>
          </div>
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease }}
          className="text-center mb-12"
        >
          <h1 className="text-[36px] sm:text-[48px] font-display font-bold text-foreground tracking-tighter leading-tight">
            {getGreeting()}, {displayName}.
          </h1>
          <p className="text-muted-foreground mt-3 text-[15px]">
            How can I help you today?
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease }}
          className="w-full max-w-xl"
        >
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Atlas anything..."
              className="w-full h-[56px] pl-6 pr-14 rounded-full glass-card text-foreground text-[15px] focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all duration-300 placeholder:text-muted-foreground"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_16px_-2px_hsl(var(--primary)/0.4)] text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap justify-center gap-2 mt-6 max-w-2xl"
        >
          {suggestions.map((s, i) => (
            <motion.button
              key={s}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.06, ease }}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setQuery(s)}
              className="px-4 py-2 rounded-full border border-border/30 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 hover:border-border/50 transition-all duration-300"
            >
              {s}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ThemedDashboard;
