import { useAtlasUi } from "@/store/atlasUiStore";
import {
  Briefcase,
  Sparkles,
  Mail,
  FileCheck,
  ChevronRight,
} from "lucide-react";

interface PromptCard {
  prompt: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CARDS: PromptCard[] = [
  {
    prompt: "Give me a full company briefing.",
    label: "Give me a full company briefing",
    icon: Briefcase,
  },
  {
    prompt: "What should I focus on today?",
    label: "What should I focus on today?",
    icon: Sparkles,
  },
  {
    prompt: "Draft a follow-up email for a stalled deal.",
    label: "Draft a follow-up email for a stalled deal",
    icon: Mail,
  },
  {
    prompt: "What compliance deadlines are coming up?",
    label: "What compliance deadlines are coming up?",
    icon: FileCheck,
  },
];

export function PromptCards() {
  const sendPrompt = useAtlasUi((s) => s.sendPrompt);

  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-500">Or try asking</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.prompt}
              onClick={() => sendPrompt(card.prompt)}
              className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left transition hover:border-slate-300 hover:shadow-sm"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 flex-shrink-0 text-slate-400 transition group-hover:text-orange-500" />
                <span className="text-sm font-medium text-slate-900">
                  {card.label}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
