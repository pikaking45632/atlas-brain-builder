import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Minus } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import AtlasLogo from "./AtlasLogo";
import MagneticButton from "./MagneticButton";
import SpotlightCard from "./SpotlightCard";
import ContactSalesModal from "./ContactSalesModal";

const ease = [0.16, 1, 0.3, 1] as const;

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  popular?: boolean;
  features: string[];
};

const plans: Plan[] = [
  {
    id: "startup",
    name: "Startup",
    price: "£9.99",
    period: "/mo",
    tagline: "For early-stage teams shipping their first AI layer.",
    features: ["Up to 5 seats", "10 modules", "5 GB storage", "Email support"],
  },
  {
    id: "sme",
    name: "SME",
    price: "£29.99",
    period: "/mo",
    tagline: "For growing businesses ready to scale intelligence.",
    popular: true,
    features: [
      "Up to 25 seats",
      "Unlimited modules",
      "50 GB storage",
      "Priority support",
      "API access",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    tagline: "Tailored deployments for regulated organisations.",
    features: [
      "Unlimited seats",
      "Dedicated infra",
      "24/7 premium support",
      "Custom SLAs",
      "On-premise option",
    ],
  },
];

// Comparison table — flesh out the detail beneath the summary cards.
const compareRows: { label: string; values: [string | boolean, string | boolean, string | boolean] }[] = [
  { label: "Team seats",            values: ["5",       "25",        "Unlimited"] },
  { label: "Knowledge modules",     values: ["10",      "Unlimited", "Unlimited"] },
  { label: "Document storage",      values: ["5 GB",    "50 GB",     "Unlimited"] },
  { label: "Source connectors",     values: [true,      true,        true] },
  { label: "Specialist agents",     values: [true,      true,        true] },
  { label: "API access",            values: [false,     true,        true] },
  { label: "Custom integrations",   values: [false,     true,        true] },
  { label: "SAML SSO",              values: [false,     false,       true] },
  { label: "Dedicated infra",       values: [false,     false,       true] },
  { label: "Custom SLA",            values: [false,     false,       true] },
  { label: "Audit log retention",   values: ["30 days", "1 year",    "Unlimited"] },
  { label: "Support channel",       values: ["Email",   "Priority",  "24/7 + CSM"] },
];

const cellRender = (v: string | boolean, idx: number) => {
  if (v === true)  return <Check className="w-4 h-4 text-accent" strokeWidth={2} />;
  if (v === false) return <Minus className="w-3.5 h-3.5 text-muted-foreground/60" strokeWidth={2} />;
  return (
    <span className={`font-mono text-[12.5px] ${idx === 1 ? "text-foreground font-medium" : "text-foreground"}`}>
      {v}
    </span>
  );
};

const StepPricing = () => {
  const { plan, setField, setStep } = useOnboarding();
  const [contactOpen, setContactOpen] = useState(false);

  const handleSelect = (planId: string) => setField("plan", planId);

  const handleContinue = () => {
    if (plan === "enterprise") {
      setContactOpen(true);
      return;
    }
    if (plan) setStep(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-border">
        <div className="flex items-center gap-8">
          <AtlasLogo />
          <span className="hidden md:inline font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
            01 / PLAN
          </span>
        </div>
        <span className="text-[13px] text-muted-foreground hidden md:block">
          Have an invite?{" "}
          <button className="link-underline text-foreground">Join your team</button>
        </span>
      </header>

      {/* Editorial header band */}
      <section className="border-b border-border bg-grid bg-grid-fade">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-20 md:py-24 grid lg:grid-cols-12 gap-8 items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="lg:col-span-8"
          >
            <span className="eyebrow">PRICING</span>
            <h1 className="display-xl mt-4 text-balance">
              Pick a plan.<br />
               Change your mind <span className="text-gradient text-warning">whenever</span>.
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease }}
            className="lg:col-span-4 text-[16px] leading-[1.7] text-muted-foreground"
          >
            Three tiers, no hidden fees. Cancel or upgrade anytime — we'll
            prorate the difference and never lock you in.
          </motion.p>
        </div>
      </section>

      {/* Summary cards */}
      <section className="max-w-[1200px] mx-auto w-full px-6 md:px-10 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p, i) => {
            const isSelected = plan === p.id;
            const isPopular = !!p.popular;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease }}
              >
                <SpotlightCard
                  className={`relative bg-card rounded-[12px] p-7 md:p-8 cursor-pointer transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? "border-2 border-accent shadow-card-hover"
                      : isPopular
                        ? "border-2 border-accent/60 hover:border-accent shadow-card hover:shadow-card-hover"
                        : "border border-border hover:border-foreground/20 shadow-card hover:shadow-card-hover"
                  }`}
                  onClick={() => handleSelect(p.id)}
                  intensity={0.07}
                >
                  {isPopular && (
                    <span className="absolute top-4 left-4 inline-flex items-center font-mono text-[10.5px] font-semibold tracking-[0.08em] uppercase px-2 py-1 rounded-full bg-accent text-accent-foreground">
                      RECOMMENDED
                    </span>
                  )}

                  <div className="flex items-baseline justify-between mt-6">
                    <h3 className="text-[18px] font-display font-semibold text-foreground">
                      {p.name}
                    </h3>
                    <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>

                  <p className="mt-2 text-[13.5px] text-muted-foreground leading-[1.55] min-h-[44px]">
                    {p.tagline}
                  </p>

                  <div className="mt-7 flex items-baseline gap-1">
                    <span className="text-[40px] font-display font-bold text-foreground tracking-[-0.03em] leading-none">
                      {p.price}
                    </span>
                    {p.period && (
                      <span className="font-mono text-[12.5px] text-muted-foreground">
                        {p.period}
                      </span>
                    )}
                  </div>

                  <ul className="mt-6 space-y-2.5">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-[13px] text-foreground/85 leading-[1.5]"
                      >
                        <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-[3px]" strokeWidth={2.25} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div
                    className={`mt-7 inline-flex items-center gap-2 text-[13px] font-medium transition-colors ${
                      isSelected ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select plan"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-[1200px] mx-auto w-full px-6 md:px-10 mt-20">
        <div className="flex items-baseline justify-between mb-6">
          <span className="eyebrow">COMPARE</span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground hidden md:inline">
            ALL PLANS · ALL FEATURES
          </span>
        </div>

        <div className="rounded-[12px] border border-border overflow-hidden bg-card">
          {/* Head */}
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] border-b border-border bg-muted/40">
            <div className="px-6 py-4 text-[12px] font-mono tracking-[0.14em] text-muted-foreground uppercase">
              Feature
            </div>
            {plans.map((p) => (
              <div
                key={p.id}
                className={`px-4 py-4 text-[13px] font-semibold text-foreground border-l border-border flex items-center gap-2 ${
                  p.popular ? "bg-accent/[0.04]" : ""
                }`}
              >
                {p.name}
                {p.popular && (
                  <span className="font-mono text-[9.5px] tracking-[0.08em] uppercase px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">
                    REC
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Rows */}
          {compareRows.map((row, ri) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1.6fr_1fr_1fr_1fr] ${
                ri !== compareRows.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="px-6 py-3.5 text-[13.5px] text-foreground">
                {row.label}
              </div>
              {row.values.map((v, vi) => (
                <div
                  key={vi}
                  className={`px-4 py-3.5 border-l border-border flex items-center ${
                    vi === 1 ? "bg-accent/[0.04]" : ""
                  }`}
                >
                  {cellRender(v, vi)}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease }}
          className="mt-12 mb-24 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(1)}
              className="btn-ghost h-[48px] px-5 text-[14px] flex items-center gap-2"
              type="button"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <MagneticButton
              onClick={handleContinue}
              disabled={!plan}
              className="btn-primary inline-flex items-center gap-2 group min-w-[220px] justify-center"
            >
              {plan === "enterprise" ? "Contact Sales" : "Continue"}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </MagneticButton>
          </div>
          <p className="text-[13px] text-muted-foreground">
            No credit card required · Setup in minutes ·{" "}
            <kbd className="kbd">⏎</kbd>
          </p>
        </motion.div>
      </section>
      <ContactSalesModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        source="pricing_enterprise"
      />
    </motion.div>
  );
};

export default StepPricing;
