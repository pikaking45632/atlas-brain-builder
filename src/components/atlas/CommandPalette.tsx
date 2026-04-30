import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  FileText,
  MessageSquarePlus,
  Upload,
  UserPlus,
  Settings as SettingsIcon,
  Plug,
  ShieldCheck,
  Compass,
  Database,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useNavigate } from "react-router-dom";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTab: (tab: "chat" | "knowledge" | "sources" | "team") => void;
  onUpload: () => void;
  onInvite: () => void;
  onNewChat: () => void;
}

interface DocResult {
  id: string;
  title: string | null;
  filename: string | null;
}

export function CommandPalette({
  open,
  onOpenChange,
  onSelectTab,
  onUpload,
  onInvite,
  onNewChat,
}: CommandPaletteProps) {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<DocResult[]>([]);

  // Load top documents when palette opens.
  useEffect(() => {
    if (!open || !workspace?.id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("documents")
        .select("id, title, filename")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!cancelled) setDocs((data as DocResult[]) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, workspace?.id]);

  function close() {
    onOpenChange(false);
    setQuery("");
  }

  function run(action: () => void) {
    close();
    // Defer to avoid the click happening during the dialog close transition.
    setTimeout(action, 50);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search documents, run commands, jump to…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(onNewChat)}>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New chat
          </CommandItem>
          <CommandItem onSelect={() => run(onUpload)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload documents
          </CommandItem>
          <CommandItem onSelect={() => run(onInvite)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite teammates
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Go to">
          <CommandItem onSelect={() => run(() => onSelectTab("chat"))}>
            <Compass className="mr-2 h-4 w-4" />
            Chat
          </CommandItem>
          <CommandItem onSelect={() => run(() => onSelectTab("knowledge"))}>
            <FileText className="mr-2 h-4 w-4" />
            Knowledge
          </CommandItem>
          <CommandItem onSelect={() => run(() => onSelectTab("sources"))}>
            <Database className="mr-2 h-4 w-4" />
            Sources
          </CommandItem>
          <CommandItem onSelect={() => run(() => onSelectTab("team"))}>
            <UserPlus className="mr-2 h-4 w-4" />
            Team
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate("/settings"))}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => navigate("/settings#integrations"))}
          >
            <Plug className="mr-2 h-4 w-4" />
            Integrations
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => navigate("/settings#security"))}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Security
          </CommandItem>
        </CommandGroup>

        {docs.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Documents">
              {docs.map((doc) => (
                <CommandItem
                  key={doc.id}
                  value={`doc-${doc.title || doc.filename || doc.id}`}
                  onSelect={() => run(() => onSelectTab("knowledge"))}
                >
                  <FileText className="mr-2 h-4 w-4 text-slate-400" />
                  <span className="truncate">
                    {doc.title || doc.filename || "Untitled"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
