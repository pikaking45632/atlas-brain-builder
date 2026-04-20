// New three-zone dashboard. Replaces the agent-forward layout: a Today
// panel on the left, the Office peek widget on the right, and a
// supporting row of secondary cards below. The original onboarding
// flow stays the entry point for unconfigured users.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Users, CalendarDays, Search, Command, Settings, Sparkles } from "lucide-react";
import AtlasLogo from "@/components/atlas/AtlasLogo";
import OfficeWidget from "@/components/office/OfficeWidget";
import TodayPanel from "@/components/office/TodayPanel";
import { useOffice } from "@/store/office";
import { useOnboarding } from "@/store/onboarding";
import { usePopInTriggers } from "@/components/office/usePopInTriggers";

const ease = [0.16, 1, 0.3, 1] as const;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { companyName } = useOnboarding();
  const { hydrate } = useOffice();
  usePopInTriggers();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease }}
      className="min-h-screen bg-background"
    >
      {/* Top nav */}
      <header className="nav-shell flex items-center justify-between px-6 border-b border-border bg-card">
        <div className="flex items-center gap-8">
          <AtlasLogo />
          <nav className="hidden md:flex items-center gap-1 ml-2">
            <button className="nav-pill text-[13px] text-foreground" data-active="true">Today</button>
            <button onClick={() => navigate("/office")} className="nav-pill text-[13px] text-muted-foreground hover:text-foreground transition-colors">Office</button>
            <button onClick={() => navigate("/hire")} className="nav-pill text-[13px] text-muted-foreground hover:text-foreground transition-colors">Hire</button>
            <button onClick={() => navigate("/chat")} className="nav-pill text-[13px] text-muted-foreground hover:text-foreground transition-colors">Chat</button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden md:flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-background hover:bg-muted text-[12.5px] text-muted-foreground transition-colors">
            <Search className="w-3.5 h-3.5" />
            Search
            <kbd className="kbd ml-2"><Command className="w-2.5 h-2.5 inline -mt-0.5" />K</kbd>
          </button>
          {[CalendarDays, Settings].map((Icon, i) => (
            <button key={i} className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Icon className="w-4 h-4" />
            </button>
          ))}
          <div className="w-px h-5 bg-border mx-1" />
          <div className="w-8 h-8 rounded-md flex items-center justify-center text-[12px] font-semibold text-accent-foreground bg-foreground">
            {companyName?.[0]?.toUpperCase() || "A"}
          </div>
        </div>
      </header>

      {/* Primary area: 12-col, max 1200px */}
      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <TodayPanel />
          </div>
          <div className="lg:col-span-5">
            <OfficeWidget />
          </div>
        </div>

        {/* Secondary row */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SecondaryCard
            icon={FileText}
            label="RECENT DOCUMENTS"
            title="3 new this week"
            hint="Atlas indexed 3 docs you uploaded"
          />
          <SecondaryCard
            icon={Users}
            label="TEAM ACTIVITY"
            title="Quiet today"
            hint="No invites pending"
          />
          <SecondaryCard
            icon={CalendarDays}
            label="UPCOMING"
            title="2 deadlines"
            hint="GDPR review · Q3 close"
          />
        </div>

        {/* Footer hint */}
        <div className="mt-12 flex items-center justify-between text-[12px] text-muted-foreground border-t border-border pt-5">
          <span className="font-mono tracking-[0.1em]">{companyName?.toUpperCase() || "ATLAS"} · ALL SYSTEMS ONLINE</span>
          <button
            onClick={() => navigate("/hire")}
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Hire more specialists
          </button>
        </div>
      </main>
    </motion.div>
  );
};

const SecondaryCard = ({
  icon: Icon,
  label,
  title,
  hint,
}: {
  icon: any;
  label: string;
  title: string;
  hint: string;
}) => (
  <div className="rounded-[12px] border border-border bg-card p-4 hover:border-foreground/15 transition-colors">
    <div className="flex items-center justify-between mb-3">
      <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">{label}</span>
      <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
    </div>
    <div className="text-[15px] font-semibold text-foreground">{title}</div>
    <div className="text-[12px] text-muted-foreground mt-1">{hint}</div>
  </div>
);

export default DashboardPage;
