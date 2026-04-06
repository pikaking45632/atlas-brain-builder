import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, ChevronDown } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { buildSystemPrompt, getActiveAgents } from "@/data/agent-prompts";
import ReactMarkdown from "react-markdown";

const ease = [0.16, 1, 0.3, 1] as const;

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/atlas-chat`;

async function streamChat({
  messages,
  systemPrompt,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  systemPrompt: string;
  onDelta: (t: string) => void;
  onDone: () => void;
  onError: (e: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, systemPrompt }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Request failed" }));
    onError(err.error || "Request failed");
    return;
  }

  if (!resp.body) { onError("No response body"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

const AtlasChat = () => {
  const { selectedModules, companyName, businessType } = useOnboarding();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const agents = getActiveAgents(selectedModules);
  const systemPrompt = buildSystemPrompt(selectedModules, companyName || "your company", businessType);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    setInput("");
    setError(null);

    const userMsg: Msg = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        systemPrompt,
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        onError: (e) => { setError(e); setIsLoading(false); },
      });
    } catch {
      setError("Connection failed. Please try again.");
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Give me a full company briefing",
    "What should I focus on today?",
    "Draft a follow-up email for a stalled deal",
    "What compliance deadlines are coming up?",
    "Help me write a job description",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Agent pills */}
      {agents.length > 0 && (
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border/10 overflow-x-auto scrollbar-hide">
          <span className="text-[11px] text-muted-foreground/60 uppercase tracking-widest font-medium shrink-0">Active agents</span>
          {agents.map((a) => (
            <span key={a.name} className="shrink-0 px-3 py-1 rounded-full text-[12px] font-medium border border-border/20 text-muted-foreground bg-muted/10">
              {a.icon} {a.name}
            </span>
          ))}
        </div>
      )}

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "var(--gradient-primary)" }}>
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-2">
              Atlas is ready
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mb-8">
              {agents.length > 0
                ? `${agents.length} specialist agent${agents.length > 1 ? "s" : ""} loaded and ready to help.`
                : "Ask me anything about your business."}
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {suggestions.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05, ease }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => send(s)}
                  className="px-4 py-2 rounded-full border border-border/20 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/20 hover:border-border/40 transition-all duration-300"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1" style={{ background: "var(--gradient-primary)" }}>
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "glass-card text-foreground rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1 bg-muted/30 border border-border/20">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-red-400 py-2"
          >
            {error}
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/10">
        <div className="relative max-w-2xl mx-auto">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask Atlas anything..."
            disabled={isLoading}
            className="w-full h-[52px] pl-5 pr-14 rounded-full glass-card text-foreground text-[14px] focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all duration-300 placeholder:text-muted-foreground disabled:opacity-50"
          />
          <button
            onClick={() => send()}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AtlasChat;
