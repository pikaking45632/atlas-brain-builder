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
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="min-h-screen flex flex-col"
    >
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <AtlasLogo />
        <StepProgress current={2} />
        <div className="w-20" />
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-foreground">About your company</h2>
            <p className="text-sm text-muted-foreground">Tell us about your business so we can tailor your AI.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Company name</label>
              <input
                value={companyName}
                onChange={(e) => setField("companyName", e.target.value)}
                placeholder="Acme Ltd"
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setField("industry", e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all appearance-none"
                >
                  <option value="">Select</option>
                  {industries.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Team size</label>
                <select
                  value={teamSize}
                  onChange={(e) => setField("teamSize", e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all appearance-none"
                >
                  <option value="">Select</option>
                  {teamSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Country</label>
                <select
                  value={country}
                  onChange={(e) => setField("country", e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all appearance-none"
                >
                  <option value="">Select</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your role</label>
                <select
                  value={role}
                  onChange={(e) => setField("role", e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all appearance-none"
                >
                  <option value="">Select</option>
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">What do you want your AI to help with? (optional)</label>
              <textarea
                value={goals}
                onChange={(e) => setField("goals", e.target.value)}
                placeholder="E.g. answering HR questions, generating risk assessments..."
                rows={3}
                className="w-full px-3.5 py-3 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="h-11 px-5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card-hover transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => canContinue && setStep(3)}
              disabled={!canContinue}
              className="flex-1 h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:brightness-110"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StepCompany;
