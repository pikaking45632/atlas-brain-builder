import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import AtlasLogo from "./AtlasLogo";
import MagneticButton from "./MagneticButton";
import SpotlightCard from "./SpotlightCard";
import LiveCounter from "./LiveCounter";

const ease = [0.16, 1, 0.3, 1] as const;

const StepWelcome = () => {
  const { email, password, setField, setStep } = useOnboarding();
  const canContinue = email.includes("@") && password.length >= 6;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease }}
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-border">
        <div className="flex items-center gap-8">
          <AtlasLogo />
          <span className="hidden md:inline font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
            v1.0 · WORKPLACE AI
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a className="link-underline text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
          <a className="link-underline text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Docs
          </a>
          <button className="text-[13px] text-foreground link-underline">
            Sign in
          </button>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-12 gap-0 max-w-[1400px] mx-auto w-full">
        {/* Left: Editorial headline + form (7 cols) */}
        <div className="lg:col-span-7 px-6 md:px-12 lg:px-16 pt-16 lg:pt-24 pb-16 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <span className="eyebrow inline-flex items-center gap-2 mb-8">
              <span className="pulse-dot pulse-dot--sm" />
              EARLY ACCESS · INVITE ONLY
            </span>

            <h1 className="display-xl text-foreground text-balance">
              The workplace<br />
              that thinks<br />
              <span className="text-gradient">with you</span><span className="caret" aria-hidden />
            </h1>

            <p className="mt-8 text-[18px] leading-[1.6] text-muted-foreground max-w-[520px]">
              Atlas builds an intelligent layer trained on your business — your
              processes, your policies, your people. Set up in minutes, not months.
            </p>
          </motion.div>

          {/* Inline auth */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease }}
            className="mt-12 max-w-[460px] w-full"
          >
            <div className="space-y-3">
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setField("email", e.target.value)}
                className="cinematic-input h-[52px]"
              />
              <input
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setField("password", e.target.value)}
                className="cinematic-input h-[52px]"
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <MagneticButton
                onClick={() => canContinue && setStep(3)}
                disabled={!canContinue}
                className="btn-primary flex-1 h-[52px] flex items-center justify-center gap-2 group"
              >
                Get started
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </MagneticButton>
              <button className="btn-ghost h-[52px] px-5 flex items-center gap-2 text-[14px]">
                <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>

            <p className="mt-3 text-[13px] text-muted-foreground">
              No credit card required · Cancel anytime · <kbd className="kbd">⏎</kbd> to continue
            </p>
          </motion.div>

          <div className="mt-auto pt-16 hidden lg:block space-y-6">
            <div className="flex items-baseline gap-3 flex-wrap">
              <LiveCounter
                target={142}
                tickIncrement={1}
                tickMs={4500}
                className="font-mono text-[15px] text-foreground font-semibold"
              />
              <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground inline-flex items-center gap-2">
                <span className="pulse-dot pulse-dot--sm" />
                QUERIES ANSWERED IN THE LAST HOUR
              </span>
            </div>
            <div>
              <span className="eyebrow">TRUSTED BY OPERATORS AT</span>
              <div className="mt-4 flex items-center gap-8 text-foreground/30 font-display font-semibold text-[15px]">
                <span>Northwind</span>
                <span>Halcyon</span>
                <span>Meridian</span>
                <span>Lumen Co.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Floating product preview (5 cols) */}
        <div className="lg:col-span-5 relative bg-foreground overflow-hidden hidden lg:block">
          {/* Faint grid texture on dark band */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />

          {/* Floating preview card — straddles the boundary, with cursor spotlight */}
          <motion.div
            initial={{ opacity: 0, x: -40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease }}
            className="absolute top-1/2 -translate-y-1/2 -left-16 w-[420px]"
          >
            <SpotlightCard className="corners glass-card p-6 shadow-[0_30px_60px_-20px_rgba(10,22,40,0.45)]" radius={520} intensity={0.1}>
              <span className="corner-tr" />
              <span className="corner-bl" />

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-[13px] font-semibold text-foreground">Atlas Finance</span>
                </div>
                <span className="mono-pill"><span className="pulse-dot pulse-dot--sm" /> LIVE</span>
              </div>

              <p className="text-[13.5px] text-foreground leading-[1.55] mb-4">
                Three invoices are 14+ days overdue. Total exposure is{" "}
                <span className="font-mono text-[13px] text-foreground bg-accent/10 px-1 rounded">£42,180</span>.
                Want me to draft polite follow-ups?
              </p>

              <div className="flex flex-col gap-2">
                {[
                  { label: "Acme Ltd", val: "£18,400", days: "21d" },
                  { label: "Halcyon Group", val: "£15,200", days: "17d" },
                  { label: "Meridian Co.", val: "£8,580", days: "14d" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-[12.5px] py-1.5 border-b border-border last:border-0">
                    <span className="text-foreground">{row.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-foreground/80">{row.val}</span>
                      <span className="mono-pill">{row.days}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button className="btn-primary text-[13px] py-2 px-4 inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Draft follow-ups
                </button>
                <span className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                  ⌘ + ⏎
                </span>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Mono caption */}
          <div className="absolute bottom-8 right-8 font-mono text-[10px] tracking-[0.14em] text-white/40">
            ATLAS / FINANCE / 04.18.26
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StepWelcome;
