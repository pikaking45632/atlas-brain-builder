// Customise modal — left half is the agent at their desk (portrait
// scaled up against the desk colour). Right half is the controls.
// Sample response preview re-renders live as sliders move.
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import { AgentId, AGENTS_BY_ID } from "@/data/agents";
import { useOffice, HiredAgent } from "@/store/office";
import { toast } from "sonner";

const ease = [0.16, 1, 0.3, 1] as const;

const DESK_COLORS = [
  { id: "oak", label: "Oak", hsl: "32 45% 65%" },
  { id: "walnut", label: "Walnut", hsl: "20 30% 35%" },
  { id: "white", label: "White", hsl: "0 0% 92%" },
  { id: "black", label: "Black", hsl: "220 10% 18%" },
] as const;

const PLANTS = [
  { id: "monstera", label: "Monstera" },
  { id: "snake", label: "Snake" },
  { id: "succulent", label: "Succulent" },
  { id: "none", label: "None" },
] as const;

const POSTERS = [
  { id: "none", label: "None" },
  { id: "city", label: "City" },
  { id: "mountains", label: "Mountains" },
  { id: "abstract", label: "Abstract" },
] as const;

const LIGHTING = [
  { id: "warm", label: "Warm" },
  { id: "cool", label: "Cool" },
  { id: "spotlight", label: "Spotlight" },
] as const;

interface Props {
  agentId: AgentId;
  onClose: () => void;
}

function sampleReply(name: string, tone: number, detail: number, voice: string): string {
  const isCasual = tone > 60;
  const isThorough = detail > 60;
  const opener = isCasual
    ? `Hey — ${name} here.`
    : `${name} reporting.`;
  const body = isThorough
    ? "I've pulled the relevant numbers, cross-referenced them with last quarter, and flagged the three lines that move the result more than 5%."
    : "Three things matter here. I'll send them as bullets.";
  return `${opener} ${body}`;
}

const Slider = ({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[12.5px] font-medium text-foreground">{label}</span>
      <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
        {value}
      </span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-accent"
    />
    <div className="flex items-center justify-between mt-1 font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
      <span>{leftLabel}</span>
      <span>{rightLabel}</span>
    </div>
  </div>
);

const CustomiseModal = ({ agentId, onClose }: Props) => {
  const seed = AGENTS_BY_ID[agentId];
  const hired = useOffice((s) => s.getHired(agentId));
  const customise = useOffice((s) => s.customise);

  const [draft, setDraft] = useState<HiredAgent | null>(hired ?? null);

  useEffect(() => {
    if (hired) setDraft(hired);
  }, [hired?.id]);

  if (!seed || !draft) return null;

  const update = (patch: Partial<HiredAgent>) => setDraft({ ...draft, ...patch });

  const reset = () => {
    setDraft({
      ...draft,
      customName: null,
      tone: 50,
      detail: 50,
      initiative: 50,
      deskColor: "oak",
      deskPlant: "monstera",
      deskPoster: "none",
      deskLighting: "warm",
    });
  };

  const save = async () => {
    await customise(agentId, draft);
    toast.success(`${draft.customName ?? seed.defaultName} updated`);
    onClose();
  };

  const deskHsl = DESK_COLORS.find((d) => d.id === draft.deskColor)?.hsl ?? "32 45% 65%";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.25, ease }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[1100px] max-h-[90vh] bg-card rounded-[12px] overflow-hidden border border-border grid grid-cols-1 lg:grid-cols-2 shadow-2xl"
      >
        {/* Left: agent at desk */}
        <div
          className="relative p-8 flex items-center justify-center min-h-[420px]"
          style={{
            background: `linear-gradient(180deg, hsl(${seed.accent} / 0.08) 0%, hsl(${seed.accent} / 0.04) 100%)`,
          }}
        >
          {/* Desk */}
          <div
            className="absolute bottom-12 left-[15%] right-[15%] h-[80px] rounded-md"
            style={{
              background: `hsl(${deskHsl})`,
              boxShadow: "0 6px 20px hsl(220 30% 20% / 0.2)",
            }}
          />
          <div
            className="relative w-[360px] h-[360px] bg-cover bg-center bg-no-repeat z-10"
            style={{ backgroundImage: `url(${seed.portrait})` }}
          />
          <div className="absolute top-6 left-6">
            <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
              {seed.role}
            </span>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex flex-col max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="text-[18px] font-semibold text-foreground">Customise agent</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Name */}
            <div>
              <label className="text-[12.5px] font-medium text-foreground block mb-1.5">
                Name
              </label>
              <input
                value={draft.customName ?? ""}
                onChange={(e) => update({ customName: e.target.value || null })}
                placeholder={seed.defaultName}
                className="cinematic-input h-10 text-[14px]"
              />
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                Default is the role name. Rename freely.
              </p>
            </div>

            {/* Personality sliders */}
            <div className="space-y-5">
              <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                PERSONALITY
              </span>
              <Slider
                label="Tone"
                leftLabel="Formal"
                rightLabel="Casual"
                value={draft.tone}
                onChange={(v) => update({ tone: v })}
              />
              <Slider
                label="Detail level"
                leftLabel="Concise"
                rightLabel="Thorough"
                value={draft.detail}
                onChange={(v) => update({ detail: v })}
              />
              <Slider
                label="Initiative"
                leftLabel="Reactive"
                rightLabel="Proactive"
                value={draft.initiative}
                onChange={(v) => update({ initiative: v })}
              />
            </div>

            {/* Sample reply preview */}
            <div className="rounded-md border border-border bg-muted/40 p-4">
              <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                SAMPLE REPLY
              </span>
              <p className="mt-2 text-[13px] leading-[1.55] text-foreground italic">
                {sampleReply(
                  draft.customName ?? seed.defaultName,
                  draft.tone,
                  draft.detail,
                  seed.voice,
                )}
              </p>
            </div>

            {/* Desk customisation */}
            <div>
              <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground block mb-3">
                DESK
              </span>
              <div className="grid grid-cols-2 gap-3">
                <SelectChips
                  label="Colour"
                  value={draft.deskColor}
                  options={DESK_COLORS as any}
                  onChange={(v) => update({ deskColor: v as any })}
                  swatch
                />
                <SelectChips
                  label="Plant"
                  value={draft.deskPlant}
                  options={PLANTS as any}
                  onChange={(v) => update({ deskPlant: v as any })}
                />
                <SelectChips
                  label="Poster"
                  value={draft.deskPoster}
                  options={POSTERS as any}
                  onChange={(v) => update({ deskPoster: v as any })}
                />
                <SelectChips
                  label="Lighting"
                  value={draft.deskLighting}
                  options={LIGHTING as any}
                  onChange={(v) => update({ deskLighting: v as any })}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex items-center justify-between gap-2">
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to defaults
            </button>
            <button
              onClick={save}
              className="h-9 px-5 rounded-md bg-accent text-accent-foreground text-[13px] font-semibold hover:bg-[hsl(224_76%_48%)] transition-colors"
            >
              Save changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SelectChips = ({
  label,
  value,
  options,
  onChange,
  swatch,
}: {
  label: string;
  value: string;
  options: { id: string; label: string; hsl?: string }[];
  onChange: (v: string) => void;
  swatch?: boolean;
}) => (
  <div>
    <span className="text-[11.5px] text-muted-foreground block mb-1.5">{label}</span>
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11.5px] font-medium border transition-all ${
            value === o.id
              ? "border-accent bg-accent/10 text-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          {swatch && o.hsl && (
            <span
              className="w-3 h-3 rounded-full border border-border"
              style={{ background: `hsl(${o.hsl})` }}
            />
          )}
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

export default CustomiseModal;
