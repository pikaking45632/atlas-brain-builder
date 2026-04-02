import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import AtlasLogo from "./AtlasLogo";

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
      className="min-h-screen flex flex-col"
    >
      <header className="flex items-center justify-between px-8 py-6">
        <AtlasLogo />
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
          Sign in
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-[440px] space-y-14">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="text-center space-y-6"
          >
            <h1 className="text-[48px] sm:text-[64px] font-display font-extrabold text-foreground leading-[1.02] tracking-tighter">
              Design your{" "}
              <span className="text-gradient">workplace AI.</span>
            </h1>
            <p className="text-muted-foreground text-[17px] leading-relaxed max-w-sm mx-auto">
              Build an intelligent model trained around your business — your processes, policies, and expertise.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease }}
            className="space-y-4"
          >
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setField("email", e.target.value)}
                className="cinematic-input h-[56px] px-5 rounded-2xl text-[15px]"
              />
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setField("password", e.target.value)}
                className="cinematic-input h-[56px] px-5 rounded-2xl text-[15px]"
              />
            </div>

            <button
              onClick={() => canContinue && setStep(3)}
              disabled={!canContinue}
              className="btn-primary w-full h-[56px] text-[15px] flex items-center justify-center gap-2"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-xs text-muted-foreground/60">or</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            <button className="btn-ghost w-full h-[56px] text-[15px] flex items-center justify-center gap-3">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-[11px] text-muted-foreground/50 pt-2">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default StepWelcome;
