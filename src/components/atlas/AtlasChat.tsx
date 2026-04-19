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
      {/* Agent strip */}
      {agents.length > 0 && (
        <div className="flex items-center gap-2 px-6 h-11 border-b border-border bg-card overflow-x-auto scrollbar-hide shrink-0">
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground shrink-0 mr-1 inline-flex items-center gap-2">
            <span className="pulse-dot pulse-dot--sm" />
            ACTIVE AGENTS
          </span>
          {agents.map((a) => (
            <span
              key={a.name}
              className="shrink-0 inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border border-border bg-background text-[11.5px] font-medium text-foreground"
            >
              <span className="status-dot" style={{ width: 5, height: 5, boxShadow: "none" }} />
              {a.name}
            </span>
          ))}
        </div>
      )}

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-[760px] mx-auto px-6 py-10 space-y-6">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="flex flex-col items-center justify-center text-center pt-12"
          >
            <div className="corners corners-subtle p-6 mb-8">
              <span className="corner-tr" />
              <span className="corner-bl" />
              <Bot className="w-7 h-7 text-foreground" strokeWidth={1.5} />
            </div>
            <span className="eyebrow mb-3">READY</span>
            <h2 className="text-[36px] font-display font-semibold text-foreground tracking-[-0.03em] leading-[1.05]">
              What should we<br />work on today?
            </h2>
            <p className="mt-4 text-[14.5px] text-muted-foreground max-w-md">
              {agents.length > 0
                ? `${agents.length} specialist agent${agents.length > 1 ? "s" : ""} loaded. Ask anything — Atlas routes the question for you.`
                : "Ask me anything about your business."}
            </p>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-[560px]">
              {suggestions.slice(0, 4).map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05, ease }}
                  onClick={() => send(s)}
                  className="text-left px-4 py-3 rounded-md border border-border bg-card text-[13px] text-foreground hover:border-foreground/30 hover:bg-card-hover transition-all duration-200 flex items-center justify-between group"
                >
                  <span>{s}</span>
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-muted-foreground group-hover:text-foreground transition-all duration-200 group-hover:translate-x-0.5" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 bg-accent/10 border border-accent/20">
                  <Bot className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-lg px-4 py-3 text-[14px] leading-[1.6] ${
                  msg.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ul]:pl-5 [&>ol]:pl-5 [&>h1]:text-[15px] [&>h2]:text-[14px] [&>h3]:text-[14px] [&_code]:font-mono [&_code]:text-[12.5px] [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_strong]:font-semibold [&_strong]:text-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 bg-card border border-border">
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
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-accent/10 border border-accent/20">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="bg-card border border-border rounded-lg px-4 py-3 inline-flex items-center gap-3">
              <span className="typing-dots" aria-label="Atlas is typing">
                <span /><span /><span />
              </span>
              <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground">THINKING</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-[13px] text-destructive py-2"
          >
            {error}
          </motion.div>
        )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card shrink-0">
        <div className="max-w-[760px] mx-auto px-6 py-4">
          <div className="relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask Atlas anything…"
              disabled={isLoading}
              className="cinematic-input h-[48px] pr-28 text-[14.5px]"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <kbd className="kbd hidden sm:inline-flex">⏎</kbd>
              <button
                onClick={() => send()}
                disabled={isLoading || !input.trim()}
                className="h-8 w-8 rounded-md flex items-center justify-center bg-accent text-accent-foreground hover:bg-[hsl(224_76%_48%)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <p className="mt-2 font-mono text-[10px] tracking-[0.14em] text-muted-foreground/70 text-center">
            ATLAS · RESPONSES MAY BE INACCURATE — VERIFY CRITICAL DETAILS
          </p>
        </div>
      </div>
    </div>
  );
};

export default AtlasChat;
