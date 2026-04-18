import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles, Building2, Rocket } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import AtlasLogo from "./AtlasLogo";

const ease = [0.16, 1, 0.3, 1] as const;

const plans = [
  {
    id: "startup",
    name: "Startup",
    price: "£9.99",
    period: "/month",
    description: "Perfect for early-stage teams building their first AI layer.",
    icon: Rocket,
    features: [
      "Up to 5 team members",
      "10 knowledge modules",
      "5GB document storage",
      "Email support",
      "Basic analytics",
    ],
    gradient: "from-transparent to-transparent",
    border: "border-border",
    glow: "hover:shadow-card-hover",
  },
  {
    id: "sme",
    name: "SME",
    price: "£29.99",
    period: "/month",
    description: "For growing businesses ready to scale their intelligence.",
    icon: Sparkles,
    popular: true,
    features: [
      "Up to 25 team members",
      "Unlimited modules",
      "50GB document storage",
      "Priority support",
      "Advanced analytics",
      "Custom integrations",
      "API access",
    ],
    gradient: "from-transparent to-transparent",
    border: "border-accent",
    glow: "hover:shadow-card-hover",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored solutions for large organisations.",
    icon: Building2,
    features: [
      "Unlimited team members",
      "Unlimited everything",
      "Dedicated infrastructure",
      "24/7 premium support",
      "Custom SLAs",
      "On-premise deployment",
      "Dedicated account manager",
    ],
    gradient: "from-transparent to-transparent",
    border: "border-border",
    glow: "hover:shadow-card-hover",
  },
];

const StepPricing = () => {
  const { plan, setField, setStep } = useOnboarding();

  const handleSelect = (planId: string) => {
    setField("plan", planId);
  };

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
      transition={{ duration: 0.6, ease }}
      className="min-h-screen flex flex-col"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease }}
        className="flex items-center justify-center pt-8 pb-4"
      >
        <AtlasLogo />
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease }}
          className="text-center mb-12 max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Choose your plan
          </h1>
          <p className="text-lg text-muted-foreground">
            Select the right tier for your business. Upgrade anytime.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {plans.map((p, i) => {
            const Icon = p.icon;
            const isSelected = plan === p.id;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease }}
                onClick={() => handleSelect(p.id)}
                className={`
                  relative rounded-xl p-8 cursor-pointer transition-all duration-200
                  bg-card shadow-card hover:shadow-card-hover hover:-translate-y-0.5
                  border ${isSelected || p.popular ? "border-2 border-accent" : "border-border"}
                  ${p.popular ? "md:-mt-4 md:mb-0 md:pb-10" : ""}
                `}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-accent text-accent-foreground text-[11px] font-semibold tracking-[0.08em] uppercase">
                    Recommended
                  </div>
                )}

                {/* Selection indicator */}
                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>

                <div className="mb-4">
                  <Icon className="w-8 h-8 text-foreground/80 mb-3" />
                  <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-foreground">{p.price}</span>
                  <span className="text-muted-foreground text-sm">{p.period}</span>
                </div>

                <ul className="space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5, ease }}
          className="mt-10"
        >
          <button
            onClick={handleContinue}
            disabled={!plan}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-100"
          >
            {plan === "enterprise" ? "Contact Sales" : "Get Started"}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-[13px] text-muted-foreground mt-3 text-center">
            No credit card required · Cancel anytime
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StepPricing;
