import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import AtlasLogo from "@/components/atlas/AtlasLogo";
import { useAuth } from "@/components/auth/AuthProvider";

const ease = [0.16, 1, 0.3, 1] as const;

const SignIn = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const invitationToken = params.get("invitation");
  const prefillEmail = params.get("email") ?? "";
  const next = params.get("next") || "/app";

  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 50);
  }, []);

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
    if (invitationToken) {
      navigate(`/join/${encodeURIComponent(invitationToken)}`, { replace: true });
    } else {
      navigate(next, { replace: true });
    }
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
                readOnly={!!prefillEmail}
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
