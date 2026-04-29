import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle, Loader2, Check } from "lucide-react";
import AtlasLogo from "@/components/atlas/AtlasLogo";
import { useAuth } from "@/components/auth/AuthProvider";

const ease = [0.16, 1, 0.3, 1] as const;

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 50);
  }, []);

  const passwordChecks = {
    length: password.length >= 8,
    mixed: /[A-Z]/.test(password) && /[a-z]/.test(password),
    digit: /\d/.test(password),
  };
  const passwordOK = passwordChecks.length && passwordChecks.mixed && passwordChecks.digit;
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && passwordOK;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError("");

    const { error: err, user } = await signUp(email, password);
    setSubmitting(false);

    if (err) {
      setError(err);
      return;
    }

    if (user) {
      navigate("/get-started", { replace: true });
    }
  };

  const Check_ = ({ ok }: { ok: boolean }) => (
    <span className={`inline-flex items-center gap-1.5 text-[11.5px] ${ok ? "text-success" : "text-text-tertiary"}`}>
      <span className={`w-3 h-3 rounded-full flex items-center justify-center ${ok ? "bg-success/15" : "bg-muted"}`}>
        {ok && <Check className="w-2 h-2" strokeWidth={3} />}
      </span>
    </span>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-border">
        <Link to="/"><AtlasLogo /></Link>
        <Link
          to="/sign-in"
          className="text-[13px] text-text-secondary hover:text-foreground transition-colors"
        >
          Already have an account? <span className="text-foreground underline underline-offset-2">Sign in</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.018em] leading-[1.15] text-foreground">
              Create your Atlas workspace
            </h1>
            <p className="mt-2 text-[14px] text-text-secondary">
              Free for 14 days. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-2xl p-6">
            <div className="space-y-1.5">
              <label className="block text-[12.5px] font-medium text-text-secondary">Work email</label>
              <input
                ref={emailRef}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cinematic-input w-full h-[42px] text-[14px]"
                placeholder="aidan@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12.5px] font-medium text-text-secondary">Password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cinematic-input w-full h-[42px] text-[14px]"
                placeholder="At least 8 characters"
              />
              {password.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Check_ ok={passwordChecks.length} />
                    <span className={`text-[11.5px] ${passwordChecks.length ? "text-text-secondary" : "text-text-tertiary"}`}>8+ characters</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check_ ok={passwordChecks.mixed} />
                    <span className={`text-[11.5px] ${passwordChecks.mixed ? "text-text-secondary" : "text-text-tertiary"}`}>Upper &amp; lower</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check_ ok={passwordChecks.digit} />
                    <span className={`text-[11.5px] ${passwordChecks.digit ? "text-text-secondary" : "text-text-tertiary"}`}>Number</span>
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12.5px] text-destructive">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!valid || submitting}
              className="btn-amber w-full h-[44px] inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] text-text-tertiary">
            By creating an account, you agree to Atlas's{" "}
            <a href="/terms" className="text-text-secondary underline underline-offset-2">Terms</a> and{" "}
            <a href="/privacy" className="text-text-secondary underline underline-offset-2">Privacy</a>.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SignUp;
