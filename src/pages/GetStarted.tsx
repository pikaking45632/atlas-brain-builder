import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Phase =
  | "checking_auth"
  | "checking_workspace"
  | "creating_workspace"
  | "error";

export default function GetStarted() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("checking_auth");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const ranRef = useRef(false);

  async function run() {
    if (ranRef.current) return;
    ranRef.current = true;

    setErrorMsg(null);
    setPhase("checking_auth");

    try {
      const {
        data: { session },
        error: sessionErr,
      } = await supabase.auth.getSession();

      if (sessionErr) throw sessionErr;

      if (!session?.user) {
        navigate("/sign-in", { replace: true });
        return;
      }

      const userId = session.user.id;
      const userEmail = session.user.email ?? "";

      setPhase("checking_workspace");
      const { data: existing, error: existingErr } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (existingErr) {
        console.warn("[GetStarted] workspace lookup failed:", existingErr);
      }

      if (existing?.workspace_id) {
        navigate("/app", { replace: true });
        return;
      }

      setPhase("creating_workspace");

      const defaultName =
        userEmail.split("@")[0]?.replace(/[._-]+/g, " ").trim() ||
        "My workspace";
      const titleCased =
        defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

      const { data: result, error: invokeErr } =
        await supabase.functions.invoke("create-workspace", {
          body: { name: `${titleCased}'s Atlas` },
        });

      if (invokeErr) {
        throw new Error(`Could not create your workspace: ${invokeErr.message}`);
      }

      const newWorkspaceId =
        (result as { workspace_id?: string; id?: string })?.workspace_id ??
        (result as { workspace_id?: string; id?: string })?.id;

      if (!newWorkspaceId) {
        throw new Error(
          "Workspace was not returned. Try refreshing — if the problem continues, contact support.",
        );
      }

      navigate("/app", { replace: true });
    } catch (err) {
      console.error("[GetStarted] failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
      ranRef.current = false;
    }
  }

  useEffect(() => {
    run();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" && !ranRef.current) {
        run();
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phaseLabel: Record<Phase, string> = {
    checking_auth: "Signing you in…",
    checking_workspace: "Looking for your workspace…",
    creating_workspace: "Setting up your workspace…",
    error: "Something went wrong",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {phase === "error" ? (
          <>
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              {phaseLabel.error}
            </h1>
            <p className="text-muted-foreground">
              {errorMsg ?? "We couldn't finish setting up your workspace. Please try again."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => run()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/sign-in", { replace: true })}
              >
                Back to sign in
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              {phaseLabel[phase]}
            </h1>
            <p className="text-muted-foreground">
              This only takes a moment.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
