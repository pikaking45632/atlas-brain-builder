import { motion } from "framer-motion";
import { useOnboarding } from "@/store/onboarding";
import AtlasLogo from "./AtlasLogo";
import { Send, Users, Video, CalendarDays, Settings } from "lucide-react";
import { useState } from "react";

const suggestions = [
  "Give me a full company briefing",
  "What are the highest priority items right now?",
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
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <AtlasLogo />
          <div className="flex items-center gap-2 ml-4">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              <span>💬</span> New Chat
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-secondary transition-colors text-foreground">
            <Users className="w-4 h-4" />
            Team Status
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <CalendarDays className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors text-foreground">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
              <Users className="w-3 h-3 text-muted-foreground" />
            </div>
            {companyName || "User"}
            <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content — centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-8">
        {/* Geodesic Sphere */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <svg
            width="280"
            height="280"
            viewBox="0 0 400 400"
            fill="none"
            className="opacity-30"
          >
            {/* Geodesic wireframe sphere */}
            <circle cx="200" cy="200" r="160" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none" />
            <ellipse cx="200" cy="200" rx="160" ry="60" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none" />
            <ellipse cx="200" cy="200" rx="160" ry="60" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none" transform="rotate(60 200 200)" />
            <ellipse cx="200" cy="200" rx="160" ry="60" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none" transform="rotate(120 200 200)" />
            <ellipse cx="200" cy="200" rx="60" ry="160" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none" />
            <ellipse cx="200" cy="200" rx="60" ry="160" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none" transform="rotate(60 200 200)" />
            <ellipse cx="200" cy="200" rx="60" ry="160" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none" transform="rotate(120 200 200)" />
            <ellipse cx="200" cy="200" rx="120" ry="160" stroke="hsl(var(--foreground))" strokeWidth="0.3" fill="none" />
            <ellipse cx="200" cy="200" rx="120" ry="160" stroke="hsl(var(--foreground))" strokeWidth="0.3" fill="none" transform="rotate(60 200 200)" />
            <ellipse cx="200" cy="200" rx="120" ry="160" stroke="hsl(var(--foreground))" strokeWidth="0.3" fill="none" transform="rotate(120 200 200)" />
            <ellipse cx="200" cy="200" rx="160" ry="120" stroke="hsl(var(--foreground))" strokeWidth="0.3" fill="none" />
            <ellipse cx="200" cy="200" rx="160" ry="120" stroke="hsl(var(--foreground))" strokeWidth="0.3" fill="none" transform="rotate(60 200 200)" />
            <ellipse cx="200" cy="200" rx="160" ry="120" stroke="hsl(var(--foreground))" strokeWidth="0.3" fill="none" transform="rotate(120 200 200)" />
            {/* Cross lines for more density */}
            <line x1="40" y1="200" x2="360" y2="200" stroke="hsl(var(--foreground))" strokeWidth="0.3" />
            <line x1="200" y1="40" x2="200" y2="360" stroke="hsl(var(--foreground))" strokeWidth="0.3" />
            <circle cx="200" cy="200" r="110" stroke="hsl(var(--foreground))" strokeWidth="0.3" fill="none" />
            <circle cx="200" cy="200" r="60" stroke="hsl(var(--foreground))" strokeWidth="0.3" fill="none" />
          </svg>
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-2"
        >
          <h1 className="text-3xl sm:text-4xl font-display font-semibold text-foreground">
            {getGreeting()}, {displayName}
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            How can I help you today?
          </p>
        </motion.div>

        {/* Chat Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="w-full max-w-xl mt-8"
        >
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Atlas anything..."
              className="w-full h-[52px] pl-5 pr-14 rounded-full border border-border bg-card text-foreground text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors text-muted-foreground">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Suggestion Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2 mt-6 max-w-2xl"
        >
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
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
