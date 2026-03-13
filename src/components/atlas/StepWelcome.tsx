import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import atlasLogoImg from "@/assets/atlas-logo.png";

const StepWelcome = () => {
  const { email, password, setField, setStep } = useOnboarding();
  const canContinue = email.includes("@") && password.length >= 6;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col"
    >
      {/* Top nav bar */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-2.5">
          <img src={atlasLogoImg} alt="Atlas" className="w-8 h-8" />
          <span className="text-lg font-display font-bold text-foreground tracking-tight">
            Atlas Intelligence Systems
          </span>
        </div>
        <button
          onClick={() => canContinue && setStep(2)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Already have an account? <span className="text-primary font-medium">Sign in</span>
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-lg space-y-10">
          {/* Hero section */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI-powered workplace intelligence
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-foreground leading-tight tracking-tight">
              Build your
              <span className="text-gradient"> workplace AI</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto leading-relaxed">
              Design an intelligent model trained around your business — your policies, processes, and industry knowledge.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-3"
          >
            <div className="p-6 rounded-2xl bg-card border border-border shadow-[var(--shadow-card)] space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Work email"
                  value={email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setField("password", e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <button
                onClick={() => canContinue && setStep(2)}
                disabled={!canContinue}
                className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:brightness-110 shadow-[var(--shadow-glow)]"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button className="w-full h-12 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted/50 transition-all flex items-center justify-center gap-2.5 shadow-[var(--shadow-card)]">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-xs text-muted-foreground pt-2">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default StepWelcome;
