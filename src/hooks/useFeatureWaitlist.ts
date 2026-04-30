import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FeatureKey =
  | "calendar"
  | "billing"
  | "integrations"
  | "security_sso"
  | "security_audit_logs"
  | "security_scim"
  | "knowledge_collections";

export function useFeatureWaitlist() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function joinWaitlist(args: {
    featureKey: FeatureKey;
    note?: string;
    workspaceId?: string | null;
  }) {
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: invokeErr } = await supabase.functions.invoke(
        "feature-waitlist",
        {
          body: {
            feature_key: args.featureKey,
            note: args.note ?? null,
            workspace_id: args.workspaceId ?? null,
          },
        },
      );
      if (invokeErr) {
        setError(invokeErr.message ?? "Could not record interest");
        return false;
      }
      if (data && (data as { error?: string }).error) {
        setError((data as { error: string }).error);
        return false;
      }
      setSubmitted(true);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSubmitted(false);
    setError(null);
  }

  return { submitting, error, submitted, joinWaitlist, reset };
}
