import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Zap,
  Database,
  Users,
  Lock,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import AtlasLogo from "@/components/atlas/AtlasLogo";
import ContactSalesModal from "@/components/atlas/ContactSalesModal";
import { JoinByLinkModal } from "@/components/atlas/JoinByLinkModal";

const ease = [0.16, 1, 0.3, 1] as const;

const Landing = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSource, setContactSource] = useState("landing_page");
  const [shrunk, setShrunk] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [joinOpen, setJoinOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openContact = (src: string) => {
    setContactSource(src);
    setContactOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===================== NAV ===================== */}
      <header
        data-shrunk={shrunk}
        className="nav-shell sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md"
      >
        <div className="max-w-content mx-auto px-6 md:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-10">
            <AtlasLogo />
            <nav className="hidden md:flex items-center gap-1">
              <a href="#features" className="nav-pill text-[13px] text-text-secondary hover:text-foreground">Features</a>
              <a href="#how-it-works" className="nav-pill text-[13px] text-text-secondary hover:text-foreground">How it works</a>
              <a href="#pricing" className="nav-pill text-[13px] text-text-secondary hover:text-foreground">Pricing</a>
              <a href="#faq" className="nav-pill text-[13px] text-text-secondary hover:text-foreground">FAQ</a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openContact("nav")}
              className="hidden sm:inline-flex h-9 px-3 items-center text-[13px] text-text-secondary hover:text-foreground transition-colors"
            >
              Contact sales
            </button>
            <Link
              to="/sign-in"
              className="hidden sm:inline-flex h-9 px-3 items-center text-[13px] text-text-secondary hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <button
              onClick={() => setJoinOpen(true)}
              className="hidden sm:inline-flex h-9 px-3 items-center text-[13px] text-text-secondary hover:text-foreground transition-colors"
            >
              Join your team
            </button>
            <Link
              to="/sign-up"
              className="btn-amber h-9 px-4 inline-flex items-center gap-1.5 text-[13px]"
            >
              Start free trial
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none opacity-50" />
        <div className="relative max-w-content mx-auto px-6 md:px-8 pt-20 md:pt-28 pb-20 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="max-w-[820px]"
          >
            <div className="inline-flex items-center gap-2 mono-pill mb-6">
              <span className="pulse-dot pulse-dot--sm" />
              <span>BUILT FOR EUROPEAN SMEs</span>
            </div>
            <h1 className="font-display font-semibold leading-[1.02] tracking-[-0.025em]">
              The intelligence layer<br />
              <span className="text-text-secondary">your team has been writing in Slack.</span>
            </h1>
            <p className="mt-6 text-[17px] sm:text-[19px] leading-[1.55] text-text-secondary max-w-[640px]">
              Atlas reads your handbooks, policies, and processes once — then answers the questions your team would otherwise interrupt each other to ask. No prompt engineering. No IT project. Just a workspace that knows how your business actually works.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/get-started"
                className="btn-amber h-12 px-6 inline-flex items-center gap-2 text-[14px] group"
              >
                Start free trial
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                onClick={() => openContact("hero")}
                className="btn-ghost h-12 px-5 inline-flex items-center gap-2 text-[14px]"
              >
                Talk to founders
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-text-tertiary">
              <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> No credit card required</span>
              <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> 14-day trial</span>
              <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> Set up in under five minutes</span>
            </div>
          </motion.div>

          {/* Hero "product peek" — abstract dashboard tile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease }}
            className="relative mt-16 md:mt-20 mx-auto max-w-[920px]"
          >
            <div className="relative rounded-[16px] border border-border bg-card overflow-hidden shadow-md">
              {/* faux nav */}
              <div className="h-10 border-b border-border bg-muted/40 flex items-center gap-2 px-4">
                <span className="w-2.5 h-2.5 rounded-full bg-border" />
                <span className="w-2.5 h-2.5 rounded-full bg-border" />
                <span className="w-2.5 h-2.5 rounded-full bg-border" />
                <span className="ml-3 font-mono text-[10.5px] tracking-[0.1em] text-text-tertiary">atlas.your-company.com</span>
              </div>
              <div className="grid grid-cols-12 min-h-[360px]">
                {/* faux sidebar */}
                <div className="hidden md:flex md:col-span-3 flex-col gap-1 p-4 border-r border-border bg-muted/30">
                  <div className="text-[10px] font-mono tracking-[0.12em] text-text-tertiary mb-1">WORKSPACE</div>
                  {["Chat", "Knowledge", "Sources", "Team"].map((label, i) => (
                    <div
                      key={label}
                      className={`px-2.5 py-1.5 rounded-md text-[12.5px] ${i === 0 ? "bg-card text-foreground border-l-2 border-amber pl-2" : "text-text-secondary"}`}
                    >
                      {label}
                    </div>
                  ))}
                  <div className="mt-auto pt-3 border-t border-border">
                    <div className="text-[10px] font-mono tracking-[0.12em] text-text-tertiary">8 AGENTS ONLINE</div>
                  </div>
                </div>
                {/* faux chat */}
                <div className="col-span-12 md:col-span-9 p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center text-[11px] font-semibold text-background shrink-0">A</div>
                    <div className="flex-1 max-w-[480px] rounded-lg bg-accent-soft px-4 py-3 text-[13.5px] text-foreground">
                      How long is parental leave for someone with three years' tenure?
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-md bg-amber flex items-center justify-center text-[11px] font-semibold text-amber-foreground shrink-0"><Sparkles className="w-3.5 h-3.5" /></div>
                    <div className="flex-1 max-w-[560px] space-y-2">
                      <p className="text-[13.5px] leading-[1.55] text-foreground">
                        Three years' tenure qualifies for the enhanced policy: 18 weeks at full pay, then up to 21 weeks at SMP. Eligibility is granted automatically — no separate request needed.
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="mono-pill"><span>📄</span> employee-handbook-v4.pdf</span>
                        <span className="mono-pill">§ 7.2 Parental leave</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== PROBLEM ===================== */}
      <section className="border-t border-border bg-muted/30">
        <div className="max-w-content mx-auto px-6 md:px-8 py-20 md:py-24">
          <div className="grid md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-4">
              <div className="eyebrow mb-3">THE PROBLEM</div>
              <h2 className="font-display font-semibold leading-[1.1] tracking-[-0.015em]">
                Your team's best knowledge lives in Slack threads.
              </h2>
            </div>
            <div className="md:col-span-7 md:col-start-6 space-y-5 text-[15.5px] leading-[1.65] text-text-secondary">
              <p>
                Every SME has the same problem. Half your operating knowledge is scattered across handbooks no one reads, Notion pages no one updates, and Slack DMs that disappear after 90 days. The other half lives in three people's heads.
              </p>
              <p>
                Generic AI tools don't help. They've read the internet, not your business. Asking ChatGPT about your parental leave policy gets you a Wikipedia summary. Asking it about your sales playbook gets you a hallucination.
              </p>
              <p className="text-foreground font-medium">
                Atlas is the opposite. It only knows your business. And it never invents what isn't there.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section id="how-it-works" className="border-t border-border">
        <div className="max-w-content mx-auto px-6 md:px-8 py-20 md:py-24">
          <div className="max-w-[640px] mb-14">
            <div className="eyebrow mb-3">HOW IT WORKS</div>
            <h2 className="font-display font-semibold leading-[1.1] tracking-[-0.015em]">
              Three steps. Five minutes. No IT project.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                icon: Database,
                title: "Upload your knowledge",
                body: "Drop in handbooks, SOPs, policies, sales decks. Atlas reads them once and indexes everything privately on infrastructure you can audit.",
              },
              {
                num: "02",
                icon: Users,
                title: "Invite your team",
                body: "Magic-link invites gated to your email domain. Each colleague added makes Atlas sharper — knowledge compounds across the workspace.",
              },
              {
                num: "03",
                icon: Sparkles,
                title: "Ask anything",
                body: "Specialist agents for HR, Sales, Ops, Finance and more. Every answer cites the source document and section — no hallucinations.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.08, duration: 0.5, ease }}
                className="rounded-[12px] border border-border bg-card p-6 hover:shadow-md transition-shadow corners corners-subtle"
              >
                <span className="corner-tr" />
                <span className="corner-bl" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-text-tertiary">{step.num}</span>
                  <step.icon className="w-4 h-4 text-text-secondary" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 text-[18px] font-display font-semibold tracking-[-0.01em] text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-text-secondary">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section id="features" className="border-t border-border bg-muted/30">
        <div className="max-w-content mx-auto px-6 md:px-8 py-20 md:py-24">
          <div className="max-w-[640px] mb-14">
            <div className="eyebrow mb-3">FEATURES</div>
            <h2 className="font-display font-semibold leading-[1.1] tracking-[-0.015em]">
              Built for the way SMEs actually work.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: Zap,
                title: "Proactive, not reactive",
                body: "Atlas surfaces what your team needs before they ask — flagging policy gaps, expiring contracts, overdue actions. Most AI tools wait for prompts. Atlas doesn't.",
              },
              {
                icon: ShieldCheck,
                title: "Cited answers only",
                body: "Every response links back to the source document and section. If Atlas doesn't have evidence, it tells you it doesn't know — never invents one.",
              },
              {
                icon: Database,
                title: "Connect what you already use",
                body: "Slack, Drive, Notion, Xero, Linear, Confluence. Atlas reads from where your knowledge lives — you don't have to migrate anything.",
              },
              {
                icon: Users,
                title: "Ten specialist agents",
                body: "Pre-built role-specific agents for HR, Finance, Sales Ops, Customer Success, Compliance, IT, Procurement, and more. No prompt engineering.",
              },
              {
                icon: Lock,
                title: "Your data stays yours",
                body: "Cloud or on-prem deployment, GDPR-compliant by default, no data used to train shared models. UK and EU hosting available.",
              },
              {
                icon: Sparkles,
                title: "Five-minute setup",
                body: "No SSO project. No IT ticket. Sign up, drop in your first document, ask your first question. The whole onboarding fits in a coffee break.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.05, duration: 0.4, ease }}
                className="rounded-[12px] border border-border bg-card p-6 flex gap-4"
              >
                <div className="shrink-0 w-9 h-9 rounded-md bg-accent-soft flex items-center justify-center">
                  <f.icon className="w-4 h-4 text-foreground" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold tracking-[-0.005em] text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-[1.6] text-text-secondary">
                    {f.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SOCIAL PROOF ===================== */}
      <section className="border-t border-border">
        <div className="max-w-content mx-auto px-6 md:px-8 py-16 md:py-20">
          <div className="eyebrow text-center mb-8">USED BY OPERATIONS-FIRST TEAMS</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center max-w-[820px] mx-auto opacity-60">
            {/* Placeholder logos — visually quiet so they don't pretend to be more than they are */}
            {["MERSONS", "MAX'S CONSULTING", "AVIVA", "STIRLING"].map((logo) => (
              <div key={logo} className="font-mono text-[12px] tracking-[0.18em] text-text-secondary">
                {logo}
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-[12px] text-text-tertiary">
            Atlas is in early access with select pilot customers across professional services, financial services, and operations.
          </p>
        </div>
      </section>

      {/* ===================== PRICING TEASER ===================== */}
      <section id="pricing" className="border-t border-border bg-muted/30">
        <div className="max-w-content mx-auto px-6 md:px-8 py-20 md:py-24">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <div className="eyebrow mb-3">PRICING</div>
            <h2 className="font-display font-semibold leading-[1.1] tracking-[-0.015em]">
              Simple, per-seat pricing.
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.6] text-text-secondary">
              Start free for 14 days. No credit card. Pay only when your team is using it.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-[920px] mx-auto">
            {[
              { name: "Startup", price: "£9.99", per: "/user/month", desc: "For early teams shipping their first AI layer.", featured: false, cta: "Start free trial", to: "/get-started" },
              { name: "SME", price: "£29.99", per: "/user/month", desc: "For growing businesses ready to scale intelligence.", featured: true, cta: "Start free trial", to: "/get-started" },
              { name: "Enterprise", price: "Custom", per: "", desc: "Tailored deployments for regulated organisations.", featured: false, cta: "Contact sales", to: null },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`rounded-[12px] border bg-card p-6 ${tier.featured ? "border-amber border-2 relative" : "border-border"}`}
              >
                {tier.featured && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-soft text-amber-soft-foreground text-[10.5px] font-mono tracking-[0.12em] border border-amber-border">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-[18px] font-display font-semibold text-foreground">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[32px] font-display font-semibold tracking-[-0.02em] text-foreground">{tier.price}</span>
                  <span className="text-[13px] text-text-secondary">{tier.per}</span>
                </div>
                <p className="mt-3 text-[13px] leading-[1.55] text-text-secondary min-h-[42px]">
                  {tier.desc}
                </p>
                {tier.to ? (
                  <Link
                    to={tier.to}
                    className={`mt-5 w-full inline-flex items-center justify-center gap-1.5 ${tier.featured ? "btn-amber" : "btn-primary"} h-10 text-[13.5px]`}
                  >
                    {tier.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => openContact("pricing_enterprise")}
                    className="mt-5 w-full btn-ghost h-10 text-[13.5px] inline-flex items-center justify-center gap-1.5"
                  >
                    {tier.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-[12.5px] text-text-tertiary">
            All plans include unlimited modules, source connectors, and specialist agents. <Link to="/get-started" className="text-foreground underline underline-offset-2">See full comparison →</Link>
          </p>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section id="faq" className="border-t border-border">
        <div className="max-w-content mx-auto px-6 md:px-8 py-20 md:py-24">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <div className="eyebrow mb-3">FAQ</div>
              <h2 className="font-display font-semibold leading-[1.1] tracking-[-0.015em]">
                Questions we get on every call.
              </h2>
              <p className="mt-4 text-[14px] leading-[1.6] text-text-secondary">
                Can't find an answer?{" "}
                <button
                  onClick={() => openContact("faq")}
                  className="text-foreground underline underline-offset-2 hover:text-amber transition-colors"
                >
                  Ask us directly.
                </button>
              </p>
            </div>
            <div className="md:col-span-7 md:col-start-6 divide-y divide-border border-y border-border">
              {[
                {
                  q: "Is my data used to train shared AI models?",
                  a: "No. Atlas keeps your knowledge isolated to your workspace. We never use customer data to train shared or third-party models. You can delete everything at any time.",
                },
                {
                  q: "Where is data hosted?",
                  a: "UK and EU regions by default, on infrastructure that meets GDPR and ISO standards. Enterprise customers can request on-premises deployment using local LLMs — no data ever leaves your network.",
                },
                {
                  q: "How is Atlas different from Glean or Microsoft Copilot?",
                  a: "Glean and Copilot are enterprise tools with enterprise pricing. Atlas is built for SMEs — pre-built specialist agents, no IT setup, no SSO project required, priced per seat. The functionality is closer to Glean's feature set, the price point is closer to a productivity SaaS.",
                },
                {
                  q: "What about hallucinations?",
                  a: "Atlas only answers from the documents and sources you've connected. Every answer cites the specific document and section. If the answer isn't in your knowledge base, Atlas tells you it doesn't know — it won't invent one.",
                },
                {
                  q: "How long does setup take?",
                  a: "Five minutes for the workspace. The first valuable answer usually comes within fifteen minutes of uploading your first document. Most teams are fully productive on day one.",
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes. Monthly plans cancel at the end of the billing period. You can export all your data at any time. No annual lock-in unless you opt into annual billing for a discount.",
                },
              ].map((item, i) => (
                <button
                  key={item.q}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full py-5 text-left flex items-start justify-between gap-4 group"
                >
                  <div className="flex-1">
                    <div className="text-[15px] font-medium text-foreground group-hover:text-amber transition-colors">
                      {item.q}
                    </div>
                    {openFaq === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.25, ease }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 text-[13.5px] leading-[1.65] text-text-secondary">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-text-tertiary shrink-0 mt-1 transition-transform duration-200 ${openFaq === i ? "rotate-180 text-foreground" : ""}`}
                    strokeWidth={1.75}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="border-t border-border bg-foreground">
        <div className="max-w-content mx-auto px-6 md:px-8 py-20 md:py-24 text-center">
          <h2 className="font-display font-semibold leading-[1.1] tracking-[-0.02em] text-background">
            Stop interrupting your team to answer the same questions.
          </h2>
          <p className="mt-5 text-[16px] leading-[1.6] text-background/70 max-w-[560px] mx-auto">
            Set up Atlas in under five minutes. Free for 14 days. No credit card required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/get-started"
              className="btn-amber h-12 px-6 inline-flex items-center gap-2 text-[14px] group"
            >
              Start free trial
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={() => openContact("final_cta")}
              className="h-12 px-5 inline-flex items-center text-[14px] text-background/80 hover:text-background border border-background/20 hover:border-background/40 rounded-md transition-colors"
            >
              Book a demo
            </button>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-content mx-auto px-6 md:px-8 py-12">
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <AtlasLogo />
              <p className="mt-3 text-[13px] leading-[1.55] text-text-secondary max-w-[260px]">
                Workplace AI for European SMEs. Built in the UK.
              </p>
              <p className="mt-4 text-[12px] text-text-tertiary">
                © {new Date().getFullYear()} Atlas Intelligence Systems Ltd. <span className="font-mono">SC870617</span>
              </p>
            </div>
            <div className="md:col-span-2">
              <div className="text-[11px] font-mono tracking-[0.14em] text-text-tertiary mb-3">PRODUCT</div>
              <ul className="space-y-2 text-[13px]">
                <li><a href="#features" className="text-text-secondary hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-text-secondary hover:text-foreground transition-colors">Pricing</a></li>
                <li><Link to="/get-started" className="text-text-secondary hover:text-foreground transition-colors">Free trial</Link></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <div className="text-[11px] font-mono tracking-[0.14em] text-text-tertiary mb-3">COMPANY</div>
              <ul className="space-y-2 text-[13px]">
                <li><button onClick={() => openContact("footer_contact")} className="text-text-secondary hover:text-foreground transition-colors">Contact sales</button></li>
                <li><a href="#faq" className="text-text-secondary hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <div className="text-[11px] font-mono tracking-[0.14em] text-text-tertiary mb-3">LEGAL</div>
              <ul className="space-y-2 text-[13px]">
                <li><a href="/privacy" className="text-text-secondary hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="/terms" className="text-text-secondary hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="/security" className="text-text-secondary hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <div className="text-[11px] font-mono tracking-[0.14em] text-text-tertiary mb-3">STATUS</div>
              <div className="inline-flex items-center gap-2 text-[12.5px] text-text-secondary">
                <span className="pulse-dot pulse-dot--sm" />
                All systems operational
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ContactSalesModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        source={contactSource}
      />
      <JoinByLinkModal open={joinOpen} onOpenChange={setJoinOpen} />
    </div>
  );
};

export default Landing;
