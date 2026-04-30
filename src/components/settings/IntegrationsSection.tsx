import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SoftLaunchModal } from "@/components/atlas/SoftLaunchModal";
import { useWorkspace } from "@/hooks/useWorkspace";

interface Integration {
  id: string;
  name: string;
  description: string;
  initial: string;
  color: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: "google_workspace",
    name: "Google Workspace",
    description: "Drive, Gmail, Calendar — Atlas reads context across the suite.",
    initial: "G",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Channel and DM context, plus ask Atlas from any channel.",
    initial: "S",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "microsoft_365",
    name: "Microsoft 365",
    description: "SharePoint, Outlook, OneDrive, Teams.",
    initial: "M",
    color: "bg-sky-100 text-sky-700",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Pull pages and databases into Atlas knowledge.",
    initial: "N",
    color: "bg-slate-100 text-slate-700",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Issues, PRs, and repo context for engineering teams.",
    initial: "G",
    color: "bg-zinc-200 text-zinc-800",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Account, opportunity, and contact context for sales agents.",
    initial: "S",
    color: "bg-cyan-100 text-cyan-700",
  },
];

export function IntegrationsSection() {
  const { workspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [activeIntegration, setActiveIntegration] =
    useState<Integration | null>(null);

  function handleClick(integration: Integration) {
    setActiveIntegration(integration);
    setOpen(true);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Integrations</h2>
        <p className="mt-1 text-sm text-slate-500">
          Connect Atlas to the tools your team already uses.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {INTEGRATIONS.map((integration) => (
          <button
            key={integration.id}
            onClick={() => handleClick(integration)}
            className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-sm"
          >
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${integration.color}`}
            >
              {integration.initial}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  {integration.name}
                </h3>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                  Soon
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {integration.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Don't see what you need? Tell us by clicking any integration above.
      </p>

      {activeIntegration && (
        <SoftLaunchModal
          open={open}
          onOpenChange={setOpen}
          featureKey="integrations"
          title={`${activeIntegration.name} integration`}
          description={activeIntegration.description}
          shippingSignal="Connectors are being built in priority order based on pilot demand. The integrations Atlas customers ask for first ship first."
          notePlaceholder={`What would you want Atlas to do with your ${activeIntegration.name} data?`}
          workspaceId={workspace?.id ?? null}
        />
      )}
    </div>
  );
}
