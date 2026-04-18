import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import AtlasLogo from "./AtlasLogo";

const ease = [0.16, 1, 0.3, 1] as const;

const plans = [
  {
    id: "startup",
    name: "Startup",
    price: "£9.99",
    period: "/mo",
    tagline: "For early-stage teams shipping their first AI layer.",
    features: [
      "Up to 5 team members",
      "10 knowledge modules",
      "5 GB document storage",
      "Email support",
      "Basic analytics",
    ],
    cta: "Start with Startup",
  },
  {
    id: "sme",
    name: "SME",
    price: "£29.99",
    period: "/mo",
    tagline: "For growing businesses ready to scale intelligence.",
    popular: true,
    features: [
      "Up to 25 team members",
      "Unlimited modules",
      "50 GB document storage",
      "Priority support",
      "Advanced analytics",
      "Custom integrations",
      "API access",
    ],
    cta: "Start with SME",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    tagline: "Tailored solutions for large, regulated organisations.",
    features: [
      "Unlimited team members",
      "Unlimited everything",
      "Dedicated infrastructure",
      "24/7 premium support",
      "Custom SLAs",
      "On-premise deployment",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
  },
];

const StepPricing = () => {
  const { plan, setField, setStep } = useOnboarding();

  const handleSelect = (planId: string) => setField("plan", planId);

  const handleContinue = () => {
    if (plan === "enterprise") {
      window.open("mailto:sales@atlas.ai?subject=Enterprise%20Inquiry", "_blank");
      return;
    }
    if (plan) setStep(2);
  };

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
            01 / PLAN
          </span>
        </div>
        <span className="text-[13px] text-muted-foreground hidden md:block">
          Have an invite? <button className="link-underline text-foreground">Join your team</button>
        </span>
      </header>

      {/* Editorial header band */}
      <section className="border-b border-border bg-grid bg-grid-fade">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-20 md:py-28 grid lg:grid-cols-12 gap-8 items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="lg:col-span-8"
          >
            <span className="eyebrow">PRICING</span>
            <h1 className="display-xl mt-4 text-balance">
              Pick a plan.<br />
              Change your mind <span className="text-gradient">whenever</span>.
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease }}
            className="lg:col-span-4 text-[16px] leading-[1.7] text-muted-foreground"
          >
            Three tiers, no hidden fees. Cancel or upgrade anytime —
            we'll prorate the difference and never lock you in.
          </motion.p>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-[1200px] mx-auto w-full px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-[14px] overflow-hidden border border-border">
          {plans.map((p, i) => {
            const isSelected = plan === p.id;
            const isPopular = p.popular;
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease }}
                onClick={() => handleSelect(p.id)}
                className={`relative text-left bg-card p-8 md:p-10 transition-all duration-200 group ${
                  isSelected || isPopular ? "" : "hover:bg-card-hover"
                }`}
              >
                {/* Selected ring */}
                {(isSelected || isPopular) && (
                  <span
                    className={`pointer-events-none absolute inset-0 ring-2 ring-inset ${
                      isSelected ? "ring-accent" : "ring-accent/40"
                    }`}
                  />
                )}

                {isPopular && (
                  <span className="absolute top-4 right-4 mono-pill bg-accent text-accent-foreground border-accent">
                    RECOMMENDED
                  </span>
                )}

                <div className="flex items-baseline justify-between">
                  <h3 className="text-[18px] font-display font-semibold text-foreground">
                    {p.name}
                  </h3>
                  <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>

                <p className="mt-2 text-[13.5px] text-muted-foreground leading-[1.55] min-h-[40px]">
                  {p.tagline}
                </p>

                <div className="mt-8 flex items-baseline gap-1">
                  <span className="text-[44px] font-display font-bold text-foreground tracking-[-0.03em] leading-none">
                    {p.price}
                  </span>
                  {p.period && (
                    <span className="font-mono text-[13px] text-muted-foreground">
                      {p.period}
                    </span>
                  )}
                </div>

                <div className="mt-8 h-px bg-border" />

                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-foreground/85 leading-[1.5]">
                      <Check className="w-4 h-4 text-accent shrink-0 mt-[2px]" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className={`mt-8 inline-flex items-center gap-2 text-[13px] font-medium transition-colors ${
                  isSelected ? "text-accent" : "text-foreground group-hover:text-accent"
                }`}>
                  {isSelected ? "Selected" : "Select plan"}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease }}
          className="mt-12 flex flex-col items-center gap-3"
        >
          <button
            onClick={handleContinue}
            disabled={!plan}
            className="btn-primary inline-flex items-center gap-2 group min-w-[220px] justify-center"
          >
            {plan === "enterprise" ? "Contact Sales" : "Continue"}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
          <p className="text-[13px] text-muted-foreground">
            No credit card required · Setup in minutes · <kbd className="kbd">⏎</kbd>
          </p>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default StepPricing;
