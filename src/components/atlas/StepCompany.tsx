import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import StepShell from "./StepShell";
import MagneticButton from "./MagneticButton";

const industries = ["Technology", "Construction", "Financial Services", "Healthcare", "Manufacturing", "Retail", "Education", "Other"];
const teamSizes = ["1–10", "11–50", "51–200", "201–500", "500+"];
const countries = ["United Kingdom", "Ireland", "United States", "Canada", "Australia", "Other"];
const roles = ["Founder / CEO", "Operations Manager", "HR Manager", "IT Manager", "Finance Manager", "Other"];

const ease = [0.16, 1, 0.3, 1] as const;

const Field = ({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[12px] font-medium text-foreground mb-1.5 block tracking-[0.04em] uppercase">
      {label}
    </label>
    {children}
    {helper && (
      <p className="mt-1.5 text-[12px] text-muted-foreground">{helper}</p>
    )}
  </div>
);

const StepCompany = () => {
  const { companyName, industry, teamSize, country, role, goals, setField, setStep } = useOnboarding();
  const canContinue = !!(companyName && industry && teamSize && country && role);

  return (
    <StepShell step={3}>
      <div className="flex-1 grid lg:grid-cols-12 gap-0 max-w-[1200px] mx-auto w-full">
        {/* Left: editorial copy */}
        <div className="lg:col-span-5 px-6 md:px-10 lg:px-12 pt-16 lg:pt-24 pb-12 lg:border-r border-border">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="eyebrow">03 / COMPANY</span>
            <h1 className="mt-4 text-[44px] sm:text-[52px] font-display font-bold text-foreground leading-[1.05] tracking-[-0.03em]">
              Tell us about<br />your company.
            </h1>
            <p className="mt-6 text-[16px] leading-[1.65] text-muted-foreground max-w-[420px]">
              Atlas tunes itself to your industry, team shape, and the
              regulations you actually care about. None of this is shared.
            </p>

            <div className="mt-10 space-y-3">
              {[
                "Sets default modules for your sector",
                "Routes legal/compliance to the right region",
                "Adapts tone to your team size",
              ].map((line, i) => (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, ease }}
                  className="flex items-start gap-2.5 text-[13.5px] text-foreground/80"
                >
                  <span className="mt-[7px] inline-block w-1 h-1 rounded-full bg-accent shrink-0" />
                  {line}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-7 px-6 md:px-10 lg:px-14 pt-16 lg:pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease }}
            className="max-w-[560px] space-y-7"
          >
            <Field label="Company name">
              <input
                value={companyName}
                onChange={(e) => setField("companyName", e.target.value)}
                placeholder="Acme Ltd"
                className="cinematic-input h-[48px]"
                autoFocus
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Industry">
                <select
                  value={industry}
                  onChange={(e) => setField("industry", e.target.value)}
                  className="cinematic-input h-[48px] cursor-pointer"
                >
                  <option value="">Select</option>
                  {industries.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
              <Field label="Team size">
                <select
                  value={teamSize}
                  onChange={(e) => setField("teamSize", e.target.value)}
                  className="cinematic-input h-[48px] cursor-pointer"
                >
                  <option value="">Select</option>
                  {teamSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Country">
                <select
                  value={country}
                  onChange={(e) => setField("country", e.target.value)}
                  className="cinematic-input h-[48px] cursor-pointer"
                >
                  <option value="">Select</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Your role">
                <select
                  value={role}
                  onChange={(e) => setField("role", e.target.value)}
                  className="cinematic-input h-[48px] cursor-pointer"
                >
                  <option value="">Select</option>
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
            </div>

            <Field label="What should Atlas help with? (optional)" helper="One sentence is plenty — we'll pick up the rest from your modules.">
              <textarea
                value={goals}
                onChange={(e) => setField("goals", e.target.value)}
                placeholder="E.g. answering HR questions, generating risk assessments…"
                rows={3}
                className="cinematic-input resize-none"
              />
            </Field>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="btn-ghost h-[48px] px-5 text-[14px] flex items-center gap-2"
                type="button"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <MagneticButton
                onClick={() => canContinue && setStep(4)}
                disabled={!canContinue}
                className="btn-primary flex-1 h-[48px] flex items-center justify-center gap-2 group"
              >
                Continue
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </div>
    </StepShell>
  );
};

export default StepCompany;
