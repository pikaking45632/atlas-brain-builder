import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import StepProgress from "./StepProgress";
import AtlasLogo from "./AtlasLogo";

const industries = ["Technology", "Construction", "Financial Services", "Healthcare", "Manufacturing", "Retail", "Education", "Other"];
const teamSizes = ["1–10", "11–50", "51–200", "201–500", "500+"];
const countries = ["United Kingdom", "Ireland", "United States", "Canada", "Australia", "Other"];
const roles = ["Founder / CEO", "Operations Manager", "HR Manager", "IT Manager", "Finance Manager", "Other"];

const StepCompany = () => {
  const { companyName, industry, teamSize, country, role, goals, setField, setStep } = useOnboarding();
  const canContinue = companyName && industry && teamSize && country && role;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-8 py-5">
        <AtlasLogo />
        <StepProgress current={2} />
        <div className="w-16" />
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-[520px] space-y-8"
        >
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
              Tell us about<br />your company.
            </h2>
            <p className="text-muted-foreground text-[15px]">
              We'll use this to personalise your AI experience.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Company name</label>
              <input
                value={companyName}
                onChange={(e) => setField("companyName", e.target.value)}
                placeholder="Acme Ltd"
                className="apple-input h-[48px] px-4 rounded-xl text-[15px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setField("industry", e.target.value)}
                  className="apple-input h-[48px] px-4 rounded-xl text-[15px] appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  {industries.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Team size</label>
                <select
                  value={teamSize}
                  onChange={(e) => setField("teamSize", e.target.value)}
                  className="apple-input h-[48px] px-4 rounded-xl text-[15px] appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  {teamSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Country</label>
                <select
                  value={country}
                  onChange={(e) => setField("country", e.target.value)}
                  className="apple-input h-[48px] px-4 rounded-xl text-[15px] appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Your role</label>
                <select
                  value={role}
                  onChange={(e) => setField("role", e.target.value)}
                  className="apple-input h-[48px] px-4 rounded-xl text-[15px] appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">What should your AI help with? <span className="normal-case text-muted-foreground/60">(optional)</span></label>
              <textarea
                value={goals}
                onChange={(e) => setField("goals", e.target.value)}
                placeholder="E.g. answering HR questions, generating risk assessments..."
                rows={3}
                className="apple-input px-4 py-3 rounded-xl text-[15px] resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="apple-btn-secondary h-[48px] px-6 text-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => canContinue && setStep(3)}
              disabled={!canContinue}
              className="apple-btn-primary flex-1 h-[48px] text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StepCompany;
