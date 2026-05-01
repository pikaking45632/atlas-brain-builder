import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Check, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type SubmitStatus = "idle" | "submitting" | "success" | "already" | "error";

interface Tier {
  name: string;
  tagline: string;
  bullets: string[];
  recommended?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Startup",
    tagline: "For early-stage teams shipping their first AI layer.",
    bullets: [
      "Up to 5 seats",
      "All 10 specialist agents",
      "Standard knowledge limits",
    ],
  },
  {
    name: "SME",
    tagline: "For growing businesses ready to scale intelligence.",
    bullets: [
      "Up to 100 seats",
      "Custom agents and workflows",
      "Priority support",
    ],
    recommended: true,
  },
  {
    name: "Enterprise",
    tagline: "Tailored deployments for regulated organisations.",
    bullets: [
      "Unlimited seats",
      "On-prem or private cloud",
      "SSO, SCIM, audit logs",
    ],
  },
];

export function WaitlistOverlay() {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  // Honeypot — real users never touch this.
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mountedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");

    try {
      const fillTime = Date.now() - mountedAtRef.current;

      const { data, error } = await supabase.functions.invoke(
        "waitlist-signup",
        {
          body: {
            email: email.trim(),
            company_name: companyName.trim() || null,
            source: "waitlist_overlay",
            website,
            fill_time_ms: fillTime,
          },
        },
      );

      if (error) {
        setStatus("error");
        setErrorMsg(error.message ?? "Something went wrong. Please try again.");
        return;
      }
      if ((data as { error?: string })?.error) {
        setStatus("error");
        setErrorMsg((data as { error: string }).error);
        return;
      }

      // Optional analytics ping. No-op if window.analytics isn't defined.
      try {
        const w = window as unknown as {
          analytics?: { track: (event: string, props?: object) => void };
        };
        w.analytics?.track?.("Waitlist Signup", {
          has_company_name: companyName.trim().length > 0,
        });
      } catch {
        // ignore
      }

      const result = data as { status?: "ok" | "already_on_list" };
      setStatus(result?.status === "already_on_list" ? "already" : "success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfaf5] text-slate-900">
      {/* Top nav — minimal */}
      <header className="border-b border-slate-200/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-sm text-white">
              A
            </div>
            Atlas
          </div>
          <Link
            to="/sign-in"
            className="text-sm text-slate-600 transition hover:text-slate-900"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-16 md:pb-20 md:pt-24">
        <div className="grid gap-10 md:grid-cols-[1.2fr,1fr] md:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500"></span>
              </span>
              Private beta · accepting pilots
            </div>

            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              The workplace that thinks{" "}
              <span className="text-orange-600">with you</span>.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Atlas is an AI co-pilot built for small businesses — bespoke to
              how your business actually works. It learns your processes, your
              policies, and your people, then helps everyone get on with the
              work that matters.
            </p>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
              We're letting customers in slowly while we make sure Atlas works
              the way it should. Put your name down and we'll be in touch.
            </p>

            {/* Form (mobile-stacked, side-by-side on md+) */}
            {status === "success" || status === "already" ? (
              <SuccessState already={status === "already"} />
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-7 max-w-md space-y-3"
                noValidate
              >
                {/* Honeypot — visually hidden, but bots fill it. */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "-10000px",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                  }}
                >
                  <label>
                    Website (leave blank)
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </label>
                </div>

                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "submitting"}
                  className="h-11 bg-white"
                  autoComplete="email"
                />
                <Input
                  type="text"
                  placeholder="Company name (optional)"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={status === "submitting"}
                  className="h-11 bg-white"
                  autoComplete="organization"
                />

                {errorMsg && (
                  <div className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={status === "submitting" || !email}
                  className="h-11 w-full bg-orange-600 text-base font-medium hover:bg-orange-700 sm:w-auto"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding you…
                    </>
                  ) : (
                    <>
                      Join the waiting list
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-slate-500">
                  No spam. We'll only email you about Atlas.
                </p>
              </form>
            )}
          </div>

          {/* Right column visual — kept simple to match existing hero layouts */}
          <div className="hidden md:block">
            <div className="relative rounded-2xl bg-slate-900 p-6 text-white shadow-lg ring-1 ring-slate-900/5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  </span>
                  Atlas Finance
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                  LIVE
                </span>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-slate-200">
                3 invoices are 14+ days overdue. Total exposure is{" "}
                <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-orange-300">
                  £42,180
                </span>
                . Want me to draft polite follow-ups?
              </p>

              <div className="space-y-1.5">
                {[
                  ["Helix Ltd", "£18,400", "21d"],
                  ["Brennan Group", "£15,200", "17d"],
                  ["Doran Co.", "£8,580", "14d"],
                ].map(([name, amount, age]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-md bg-slate-800/60 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-300">{name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-100">{amount}</span>
                      <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                        {age}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                disabled
                className="mt-4 w-full rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white opacity-90"
              >
                Draft follow-ups
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What Atlas does */}
      <section className="border-t border-slate-200/60 bg-white/40">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-500">
              What Atlas is
            </p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              An AI co-pilot built for{" "}
              <span className="text-orange-600">your</span> business — not the
              average one.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Most AI tools are general-purpose. Atlas is the opposite: it's
              trained on your processes, your policies, and your people, so
              every answer reflects how your business actually runs. Ten
              specialist agents — Finance, HR, Sales Ops, Compliance, and more
              — that work together, share context, and surface the things you'd
              normally miss.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              We're transparent about what Atlas does and doesn't do today. If
              we can't help with something, we'll tell you. If we can, we'll
              show you exactly how.
            </p>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="border-t border-slate-200/60">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mb-10 max-w-2xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-500">
              Plans
            </p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Three tiers. Pay for what you actually use.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Final pricing lands when we open the doors. The shape is set —
              start small, scale into SME, expand to enterprise on your terms.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border bg-white p-6 transition ${
                  tier.recommended
                    ? "border-slate-900 shadow-md"
                    : "border-slate-200"
                }`}
              >
                {tier.recommended && (
                  <div className="mb-3 inline-block rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Recommended
                  </div>
                )}
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{tier.tagline}</p>
                <ul className="mt-5 space-y-2">
                  {tier.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} Atlas Intelligence Systems Ltd ·
            Scotland, UK
          </span>
          <Link
            to="/sign-in"
            className="text-slate-600 transition hover:text-slate-900"
          >
            Existing customer? Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}

function SuccessState({ already }: { already: boolean }) {
  return (
    <div className="mt-7 max-w-md rounded-xl border border-green-200 bg-green-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
          <Check className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {already ? "You're already on the list" : "You're on the list"}
          </h3>
          <p className="mt-1 text-sm text-slate-700">
            {already
              ? "We have your email already — no need to sign up again. We'll be in touch when it's your turn."
              : "Thanks. Check your inbox for confirmation. We'll be in touch when it's your turn."}
          </p>
        </div>
      </div>
    </div>
  );
}
