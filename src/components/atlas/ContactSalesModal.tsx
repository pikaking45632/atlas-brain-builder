import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check, Loader2 } from "lucide-react";
import { getBackendClient } from "@/lib/backend";
import { useToast } from "@/hooks/use-toast";

const ease = [0.16, 1, 0.3, 1] as const;

interface ContactSalesModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional source label, e.g. "pricing_enterprise", "footer", "nav". */
  source?: string;
}

const teamSizes = [
  "Just me",
  "2–10",
  "11–50",
  "51–200",
  "200+",
] as const;

const ContactSalesModal = ({ open, onClose, source = "landing_page" }: ContactSalesModalProps) => {
  const { toast } = useToast();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [teamSize, setTeamSize] = useState<string>("");
  const [message, setMessage] = useState("");
  // Honeypot field — must stay empty. Hidden from users via CSS.
  const [website, setWebsite] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setSubmitted(false);
      setError("");
      // Tiny delay so the field is mounted before we focus.
      setTimeout(() => firstFieldRef.current?.focus(), 50);
    }
  }, [open]);

  // Lock body scroll while modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const valid =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    message.trim().length >= 10;

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const client = getBackendClient();
      if (!client) throw new Error("Backend unavailable. Please try again later.");

      const { data, error: fnError } = await client.functions.invoke("submit-contact", {
        body: {
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          team_size: teamSize || undefined,
          message: message.trim(),
          source,
          website, // honeypot — server side rejects if non-empty
        },
      });

      // Supabase functions.invoke returns { data, error }. fnError covers
      // network/transport errors; data.error covers application errors.
      if (fnError) throw new Error(fnError.message || "Network error");
      if (data && (data as any).error) throw new Error((data as any).error);

      setSubmitted(true);
      toast({
        title: "Message sent",
        description: "We'll be in touch within one business day.",
      });
    } catch (err: any) {
      const msg = err?.message || "Something went wrong. Please try again.";
      setError(msg);
      toast({
        title: "Couldn't send",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
          aria-modal="true"
          role="dialog"
        >
          {/* Scrim */}
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm cursor-default"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease }}
            className="relative w-full max-w-[480px] bg-card border border-border rounded-[16px] shadow-md overflow-hidden"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 rounded-md flex items-center justify-center text-text-tertiary hover:text-foreground hover:bg-muted transition-colors z-10"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>

            {!submitted ? (
              <div className="p-7 sm:p-8">
                <div className="eyebrow mb-3">CONTACT SALES</div>
                <h2 className="text-[22px] sm:text-[24px] font-display font-semibold leading-[1.2] tracking-[-0.015em] text-foreground">
                  Tell us what you're trying to solve.
                </h2>
                <p className="mt-2 text-[13.5px] leading-[1.55] text-text-secondary">
                  We'll reply within one business day. No pitch deck — just answers.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                        Your name
                      </label>
                      <input
                        ref={firstFieldRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="cinematic-input w-full h-[40px] text-[14px]"
                        placeholder="Aidan Howell"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                        Work email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="cinematic-input w-full h-[40px] text-[14px]"
                        placeholder="aidan@company.com"
                        maxLength={200}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                        Company <span className="text-text-tertiary font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="cinematic-input w-full h-[40px] text-[14px]"
                        placeholder="Acme Ltd"
                        maxLength={200}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                        Team size <span className="text-text-tertiary font-normal">(optional)</span>
                      </label>
                      <select
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        className="w-full h-[40px] px-3 pr-8 rounded-md border border-border bg-card text-[14px] text-foreground focus:outline-none focus:border-amber focus:ring-[3px] focus:ring-amber/30 transition-[border-color,box-shadow] duration-150"
                      >
                        <option value="">Select…</option>
                        {teamSizes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                      What are you trying to solve?
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="cinematic-input w-full text-[14px] py-2.5 resize-none"
                      placeholder="A few lines on the workflow, the team, and what's broken about how it works today."
                      maxLength={2000}
                    />
                    <div className="mt-1 text-right text-[11px] font-mono text-text-tertiary">
                      {message.length}/2000
                    </div>
                  </div>

                  {/* Honeypot — visually hidden, bots fill it. */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "-9999px",
                      top: "-9999px",
                      width: 1,
                      height: 1,
                      opacity: 0,
                      pointerEvents: "none",
                    }}
                  >
                    <label>Website</label>
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12.5px] text-destructive">
                      {error}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-[11.5px] text-text-tertiary leading-tight max-w-[200px]">
                    By sending, you agree we may reply to your email.
                  </p>
                  <button
                    onClick={handleSubmit}
                    disabled={!valid || submitting}
                    className="btn-amber inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send message
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease }}
                className="p-7 sm:p-8 text-center"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-success" strokeWidth={2.5} />
                </div>
                <h2 className="mt-4 text-[20px] font-display font-semibold tracking-[-0.015em] text-foreground">
                  Message received.
                </h2>
                <p className="mt-2 text-[14px] leading-[1.55] text-text-secondary max-w-[320px] mx-auto">
                  We'll be in touch within one business day. In the meantime, you can keep exploring Atlas.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 btn-ghost text-[13px]"
                >
                  Close
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactSalesModal;
