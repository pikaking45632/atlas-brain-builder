import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import AtlasLogo from "./AtlasLogo";
import { useOnboarding } from "@/store/onboarding";

const StepWelcome = () => {
  const { email, password, setField, setStep } = useOnboarding();

  const canContinue = email.includes("@") && password.length >= 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex min-h-screen items-center justify-center px-4"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AtlasLogo size="large" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            Build your workplace AI
          </h1>
          <p className="text-muted-foreground text-base max-w-sm mx-auto">
            Design an AI model trained around your business — your policies, your processes, your industry.
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Work email"
              value={email}
              onChange={(e) => setField("email", e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setField("password", e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          <button
            onClick={() => canContinue && setStep(2)}
            disabled={!canContinue}
            className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:brightness-110"
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="relative flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button className="w-full h-12 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-card-hover transition-all flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </motion.div>
  );
};

export default StepWelcome;
