import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface JoinByLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Extract a token from either a full invite URL or a raw token.
 * Accepts:
 *   https://atlasintelligencesystems.lovable.app/join/abc123
 *   /join/abc123
 *   abc123
 */
function extractToken(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // If it looks like a URL or path, pull the segment after /join/.
  const joinMatch = trimmed.match(/\/join\/([^/?#\s]+)/);
  if (joinMatch) return decodeURIComponent(joinMatch[1]);

  // Otherwise treat the whole thing as a token, but reject garbage.
  // Real tokens are 24 random bytes base64'd → ~32 chars.
  if (/^[A-Za-z0-9_-]{16,128}$/.test(trimmed)) return trimmed;

  return null;
}

export function JoinByLinkModal({ open, onOpenChange }: JoinByLinkModalProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setInput("");
    setError(null);
    setValidating(false);
  }

  function handleClose(next: boolean) {
    if (!next) setTimeout(reset, 200);
    onOpenChange(next);
  }

  async function handleContinue() {
    setError(null);
    const token = extractToken(input);
    if (!token) {
      setError("That doesn't look like a valid invite link or code.");
      return;
    }

    setValidating(true);
    try {
      // Pre-flight: check the invitation exists and is still valid before
      // sending the user to /join. Saves them clicking through to an error.
      const { data, error: invokeErr } = await supabase.functions.invoke(
        "invitation-lookup",
        { body: { token } },
      );

      if (invokeErr) {
        setError(invokeErr.message ?? "Could not validate invitation");
        return;
      }
      const errKey = (data as { error?: string })?.error;
      if (errKey === "invitation_not_found") {
        setError("No invitation matches this link. Double-check it with the sender.");
        return;
      }
      if (errKey) {
        // Still navigate — JoinPage handles every error state with a clear UI.
        // This includes expired/revoked/already accepted — better to show the
        // detailed page than a curt modal error.
      }

      handleClose(false);
      navigate(`/join/${encodeURIComponent(token)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setValidating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join your team</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-600">
          Paste the invite link (or just the code) you received in your email.
        </p>

        <div className="space-y-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://atlasintelligencesystems.lovable.app/join/…"
            disabled={validating}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleContinue();
            }}
            autoFocus
          />
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="ghost"
            onClick={() => handleClose(false)}
            disabled={validating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={validating || !input.trim()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {validating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking…
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
