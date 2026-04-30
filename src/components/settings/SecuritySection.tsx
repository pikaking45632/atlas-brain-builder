import { useState } from "react";
import { SoftLaunchModal } from "@/components/atlas/SoftLaunchModal";
import { useWorkspace } from "@/hooks/useWorkspace";
import {
  KeyRound,
  ScrollText,
  Users2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import type { FeatureKey } from "@/hooks/useFeatureWaitlist";

interface SecurityFeature {
  key: FeatureKey;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  shippingSignal: string;
}

const FEATURES: SecurityFeature[] = [
  {
    key: "security_sso",
    icon: KeyRound,
    title: "SAML SSO",
    description:
      "Sign in with Okta, Google Workspace, Microsoft Entra, or any SAML 2.0 provider.",
    shippingSignal:
      "Launching with our first enterprise customer. SCIM-compliant from day one.",
  },
  {
    key: "security_audit_logs",
    icon: ScrollText,
    title: "Audit logs",
    description:
      "Tamper-evident log of every workspace action: sign-ins, document access, prompts, settings changes.",
    shippingSignal:
      "Required for SOC 2 — building alongside our compliance audit. Q3 target.",
  },
  {
    key: "security_scim",
    icon: Users2,
    title: "SCIM provisioning",
    description:
      "Auto-provision and de-provision users from your IdP. Required for IT teams managing 50+ seats.",
    shippingSignal:
      "Ships with SAML SSO. Both gate enterprise contracts so they ship together.",
  },
];

export function SecuritySection() {
  const { workspace } = useWorkspace();
  const [active, setActive] = useState<SecurityFeature | null>(null);
  const [open, setOpen] = useState(false);

  function openFeature(feature: SecurityFeature) {
    setActive(feature);
    setOpen(true);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Security</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enterprise controls for IT, compliance, and security teams.
        </p>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-300" />
          <div>
            <h3 className="text-sm font-semibold">Already in place</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-200">
              <li className="flex items-start gap-2">
                <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-orange-300" />
                Row-level security on every workspace resource
              </li>
              <li className="flex items-start gap-2">
                <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-orange-300" />
                Encrypted at rest and in transit (AES-256, TLS 1.3)
              </li>
              <li className="flex items-start gap-2">
                <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-orange-300" />
                Per-workspace data isolation
              </li>
              <li className="flex items-start gap-2">
                <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-orange-300" />
                On-prem deployment available for enterprise customers
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Coming with enterprise
        </h3>
        <div className="space-y-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.key}
                onClick={() => openFeature(feature)}
                className="flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-sm"
              >
                <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-700" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">
                      {feature.title}
                    </h4>
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                      Soon
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {feature.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {active && (
        <SoftLaunchModal
          open={open}
          onOpenChange={setOpen}
          featureKey={active.key}
          title={active.title}
          description={active.description}
          shippingSignal={active.shippingSignal}
          notePlaceholder="What's your IdP? How many seats? Any compliance requirements (SOC 2, ISO 27001, HIPAA)?"
          workspaceId={workspace?.id ?? null}
        />
      )}
    </div>
  );
}
