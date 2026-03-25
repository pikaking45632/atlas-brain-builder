import { motion } from "framer-motion";
import { useOnboarding } from "@/store/onboarding";
import AtlasLogo from "./AtlasLogo";
import { Send, Users, CalendarDays, Settings } from "lucide-react";
import { useState } from "react";

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
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Top Nav */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border/50">
        <AtlasLogo />
        <div className="flex items-center gap-1">
          <button className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
            <Users className="w-4 h-4" />
          </button>
          <button className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
            <CalendarDays className="w-4 h-4" />
          </button>
          <button className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
            <Settings className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold">
            {companyName?.[0]?.toUpperCase() || "A"}
          </div>
        </div>
      </header>

      {/* Main — centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
        {/* Sphere */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <svg
            width="200"
            height="200"
            viewBox="0 0 400 400"
            fill="none"
            className="opacity-[0.12]"
          >
            <circle cx="200" cy="200" r="160" stroke="hsl(var(--foreground))" strokeWidth="0.8" fill="none" />
            <ellipse cx="200" cy="200" rx="160" ry="60" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none" />
            <ellipse cx="200" cy="200" rx="160" ry="60" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none" transform="rotate(60 200 200)" />
            <ellipse cx="200" cy="200" rx="160" ry="60" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none" transform="rotate(120 200 200)" />
            <ellipse cx="200" cy="200" rx="60" ry="160" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none" />
            <ellipse cx="200" cy="200" rx="60" ry="160" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none" transform="rotate(60 200 200)" />
            <ellipse cx="200" cy="200" rx="60" ry="160" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none" transform="rotate(120 200 200)" />
            <circle cx="200" cy="200" r="110" stroke="hsl(var(--foreground))" strokeWidth="0.3" fill="none" />
            <circle cx="200" cy="200" r="60" stroke="hsl(var(--foreground))" strokeWidth="0.3" fill="none" />
          </svg>
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-[42px] font-display font-bold text-foreground tracking-tight leading-tight">
            {getGreeting()}, {displayName}.
          </h1>
          <p className="text-muted-foreground mt-2 text-[15px]">
            How can I help you today?
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Atlas anything..."
              className="w-full h-[52px] pl-5 pr-14 rounded-full border border-border bg-card text-foreground text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground/20 transition-all placeholder:text-muted-foreground"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-foreground hover:opacity-80 flex items-center justify-center transition-opacity text-background">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2 mt-5 max-w-2xl"
        >
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            >
              {s}
            </button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ThemedDashboard;
