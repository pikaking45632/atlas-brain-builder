import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import AtlasLogo from "@/components/atlas/AtlasLogo";
import { useAuth } from "@/components/auth/AuthProvider";
import { lovable } from "@/integrations/lovable";

const ease = [0.16, 1, 0.3, 1] as const;

const SignIn = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/app";

  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [appleLoading, setAppleLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 50);
  }, []);

  const handleApple = async () => {
    if (appleLoading) return;
    setAppleLoading(true);
    setError("");
    const result = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin + next,
    });
    if (result.error) {
      setAppleLoading(false);
      setError(typeof result.error === "string" ? result.error : "Could not sign in with Apple.");
      return;
    }
    if (result.redirected) return;
    navigate(next, { replace: true });
  };

  const valid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length >= 6;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError("");
    const { error: err } = await signIn(email, password);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    navigate(next, { replace: true });
  };

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
          to="/sign-up"
          className="text-[13px] text-text-secondary hover:text-foreground transition-colors"
        >
          Need an account? <span className="text-foreground underline underline-offset-2">Sign up</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.018em] leading-[1.15] text-foreground">
              Sign in to Atlas
            </h1>
            <p className="mt-2 text-[14px] text-text-secondary">
              The intelligence layer for your team.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-card border border-border rounded-2xl p-6"
          >
            <div className="space-y-1.5">
              <label className="block text-[12.5px] font-medium text-text-secondary">
                Work email
              </label>
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
              <label className="block text-[12.5px] font-medium text-text-secondary">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cinematic-input w-full h-[42px] text-[14px]"
                placeholder="••••••••"
              />
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
              className="btn-primary w-full h-[44px] inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-2 text-[11px] uppercase tracking-wider text-text-tertiary">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApple}
              disabled={appleLoading}
              className="w-full h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity text-[14px] font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {appleLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M16.365 1.43c0 1.14-.45 2.23-1.18 3.04-.78.86-2.05 1.52-3.1 1.43-.13-1.1.43-2.27 1.13-3.02.79-.86 2.13-1.49 3.15-1.45zM20.5 17.27c-.6 1.39-.88 2.01-1.65 3.24-1.07 1.7-2.58 3.82-4.45 3.84-1.66.02-2.09-1.08-4.34-1.07-2.25.01-2.72 1.09-4.39 1.07-1.87-.02-3.3-1.94-4.37-3.64C-1 16.85-.95 11.96 1.45 9.34c1.32-1.45 3.4-2.36 5.36-2.36 2 0 3.25 1.1 4.91 1.1 1.6 0 2.58-1.1 4.89-1.1 1.74 0 3.59.95 4.9 2.59-4.31 2.36-3.6 8.5-1.01 7.7z"/>
                </svg>
              )}
              Continue with Apple
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] text-text-tertiary">
            By continuing, you agree to Atlas's{" "}
            <a href="/terms" className="text-text-secondary underline underline-offset-2">Terms</a> and{" "}
            <a href="/privacy" className="text-text-secondary underline underline-offset-2">Privacy</a>.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SignIn;
