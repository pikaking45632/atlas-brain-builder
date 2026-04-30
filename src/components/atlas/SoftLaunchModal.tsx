import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFeatureWaitlist, type FeatureKey } from "@/hooks/useFeatureWaitlist";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

interface SoftLaunchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureKey: FeatureKey;
  title: string;
  /** One-sentence description of what the feature will do. */
  description: string;
  /** Concrete shipping signal, e.g. "Launching with the Google Workspace connector." */
  shippingSignal: string;
  /** Placeholder for the optional note textarea. */
  notePlaceholder?: string;
  workspaceId?: string | null;
}

export function SoftLaunchModal({
  open,
  onOpenChange,
  featureKey,
  title,
  description,
  shippingSignal,
  notePlaceholder = "Anything specific you'd want this to do? (optional)",
  workspaceId,
}: SoftLaunchModalProps) {
  const { submitting, error, submitted, joinWaitlist, reset } =
    useFeatureWaitlist();
  const [note, setNote] = useState("");

  // Reset when modal closes so reopening gives a fresh state.
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        reset();
        setNote("");
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open, reset]);

  async function handleSubmit() {
    const ok = await joinWaitlist({
      featureKey,
      note: note.trim() || undefined,
      workspaceId,
    });
    if (ok) {
      // Auto-close after a short success display.
      setTimeout(() => onOpenChange(false), 1400);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-200">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            Coming soon
          </div>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-600">{description}</p>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            {shippingSignal}
          </div>

          {!submitted && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">
                Tell us what you'd use it for
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={notePlaceholder}
                rows={3}
                className="resize-none"
                disabled={submitting}
              />
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              <Check className="h-4 w-4" />
              You're on the list. We'll email you when it's live.
            </div>
          ) : (
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Maybe later
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding…
                  </>
                ) : (
                  "Notify me"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
