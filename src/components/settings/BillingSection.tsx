import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SoftLaunchModal } from "@/components/atlas/SoftLaunchModal";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Sparkles, CreditCard } from "lucide-react";

export function BillingSection() {
  const { workspace } = useWorkspace();
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Billing</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage your plan, seats, and invoices.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              Current plan
            </div>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              Pilot — Free
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Full access while we run pilots. No card on file.
            </p>
          </div>
          <Sparkles className="h-5 w-5 text-orange-500" />
        </div>

        <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-slate-400" />
            Unlimited documents and chat
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-slate-400" />
            All 10 specialist agents
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-slate-400" />
            Up to 15 concurrent users
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-5">
        <div className="flex items-start gap-3">
          <CreditCard className="mt-0.5 h-5 w-5 text-slate-400" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900">
              Paid plans coming soon
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              £29.99 per seat / month, billed annually. Stripe checkout, invoices,
              and seat management land alongside our first paying customer.
            </p>
            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Get notified when billing launches
            </Button>
          </div>
        </div>
      </div>

      <SoftLaunchModal
        open={open}
        onOpenChange={setOpen}
        featureKey="billing"
        title="Stripe billing"
        description="Self-serve seat billing with Stripe — checkout, invoices, proration, annual discounts."
        shippingSignal="Launching with our first paying customer. Free for pilots until then."
        notePlaceholder="How many seats are you planning for? Annual or monthly?"
        workspaceId={workspace?.id ?? null}
      />
    </div>
  );
}
