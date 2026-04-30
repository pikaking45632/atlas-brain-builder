import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Building2,
  CreditCard,
  Plug,
  Shield,
  LogOut,
} from "lucide-react";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { WorkspaceSection } from "@/components/settings/WorkspaceSection";
import { BillingSection } from "@/components/settings/BillingSection";
import { IntegrationsSection } from "@/components/settings/IntegrationsSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type SectionKey =
  | "profile"
  | "workspace"
  | "billing"
  | "integrations"
  | "security";

const SECTIONS: { key: SectionKey; label: string; icon: typeof User }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "workspace", label: "Workspace", icon: Building2 },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "integrations", label: "Integrations", icon: Plug },
  { key: "security", label: "Security", icon: Shield },
];

function readHash(): SectionKey {
  const raw = window.location.hash.replace("#", "");
  if (SECTIONS.some((s) => s.key === raw)) return raw as SectionKey;
  return "profile";
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<SectionKey>(() => readHash());

  useEffect(() => {
    const handler = () => setActive(readHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  function go(section: SectionKey) {
    window.location.hash = section;
    setActive(section);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[#fbfaf5]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Atlas
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[220px,1fr]">
          {/* Sidebar */}
          <nav className="space-y-1">
            <h1 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900">
              Settings
            </h1>
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => go(s.key)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}

            <div className="my-3 border-t border-slate-200" />

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>

          {/* Content */}
          <main className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {active === "profile" && <ProfileSection />}
            {active === "workspace" && <WorkspaceSection />}
            {active === "billing" && <BillingSection />}
            {active === "integrations" && <IntegrationsSection />}
            {active === "security" && <SecuritySection />}
          </main>
        </div>
      </div>
    </div>
  );
}
