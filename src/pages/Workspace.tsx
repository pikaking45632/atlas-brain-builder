import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  CalendarDays,
  Settings as SettingsIcon,
  Command,
  Upload,
  X,
  Plus,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { useAuth } from "@/components/auth/AuthProvider";
import { getBackendClient } from "@/lib/backend";
import { useToast } from "@/hooks/use-toast";
import AtlasLogo from "@/components/atlas/AtlasLogo";
import AtlasChat from "@/components/atlas/AtlasChat";
import { useAtlasUi, type AtlasTab } from "@/store/atlasUiStore";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { AccountMenu } from "@/components/atlas/AccountMenu";
import { WorkspaceSwitcher } from "@/components/atlas/WorkspaceSwitcher";
import { CommandPalette } from "@/components/atlas/CommandPalette";
import { KnowledgeView } from "@/components/atlas/KnowledgeView";
import { TeamView } from "@/components/atlas/TeamView";
import { SoftLaunchModal } from "@/components/atlas/SoftLaunchModal";
import ConnectSources from "@/components/atlas/ConnectSources";

interface DocRow {
  id: string;
  file_name: string;
  file_size: number | null;
  user_id: string;
}

interface MemberRow {
  user_id: string;
  role: string;
}

const Workspace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, workspace } = useAuth();
  const { hasUploadedDocuments, invitesSentCount, markUploaded } = useOnboarding();

  const [shrunk, setShrunk] = useState(false);
  const [inviteBannerDismissed, setInviteBannerDismissed] = useState(false);

  const [documents, setDocuments] = useState<DocRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const activeTab = useAtlasUi((s) => s.activeTab);
  const setActiveTab = useAtlasUi((s) => s.setActiveTab);
  const palette = useCommandPalette();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  // Sticky-nav scroll-shrink
  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const refreshDocuments = async () => {
    const client = getBackendClient();
    if (!client || !workspace?.id) { setLoadingDocs(false); return; }
    try {
      // Workspace-scoped: every member sees every document in this workspace.
      const { data } = await client
        .from("documents")
        .select("id, file_name, file_size, user_id")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false });
      setDocuments(data || []);
      if ((data || []).length > 0) markUploaded();
    } finally {
      setLoadingDocs(false);
    }
  };

  const refreshMembers = async () => {
    const client = getBackendClient();
    if (!client || !workspace?.id) return;
    const { data } = await client
      .from("workspace_members")
      .select("user_id, role")
      .eq("workspace_id", workspace.id);
    setMembers(data || []);
  };

  useEffect(() => {
    refreshDocuments();
    refreshMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?.id]);

  const docCount = documents.length;
  const hasDocs = docCount > 0;
  const memberCount = members.length || 1;
  const hasEnoughInvites = invitesSentCount >= 3 || memberCount >= 3;
  const showInviteBanner = !hasEnoughInvites && !inviteBannerDismissed;

  const handleUploadClick = () => {
    if (!user || !workspace) return;
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.pptx,.md";
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (!target.files?.length) return;
      const client = getBackendClient();
      if (!client) { toast({ title: "Backend unavailable", variant: "destructive" }); return; }

      let uploaded = 0;
      for (const file of Array.from(target.files)) {
        try {
          // Path convention: <workspace_id>/<user_id>/<filename>
          // Storage RLS reads workspace_id from the first folder segment.
          const filePath = `${workspace.id}/${user.id}/${Date.now()}-${file.name}`;
          const { error: upErr } = await client.storage.from("documents").upload(filePath, file);
          if (upErr) throw upErr;
          await client.from("documents").insert({
            user_id: user.id,
            workspace_id: workspace.id,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
          });
          uploaded++;
        } catch (err) {
          console.error("upload failed:", err);
        }
      }
      if (uploaded > 0) {
        markUploaded();
        toast({
          title: `${uploaded} document${uploaded > 1 ? "s" : ""} uploaded`,
          description: "Atlas is indexing — answers will improve in the next minute.",
        });
        await refreshDocuments();
      }
    };
    input.click();
  };

  const goToInvites = () => {
    sessionStorage.setItem("invite_return_to", "/app");
    navigate("/get-started");
  };

  const initial = user?.email?.[0]?.toUpperCase() || "A";

  const tabClass = (key: AtlasTab) =>
    activeTab === key
      ? "nav-pill text-[13px] text-foreground"
      : "nav-pill text-[13px] text-text-secondary hover:text-foreground transition-colors cursor-pointer";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen h-screen flex flex-col bg-background"
    >
      {/* ============ ACTIVATION BANNER STACK ============ */}
      {!hasDocs && !loadingDocs && (
        <div className="h-11 flex items-center justify-between px-6 bg-amber-soft border-b border-amber-border shrink-0">
          <div className="flex items-center gap-2 text-[13px] text-amber-soft-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
            <span className="font-medium">Atlas needs context to help you.</span>
            <span className="hidden sm:inline text-amber-soft-foreground/80">
              Upload your first document to unlock cited answers.
            </span>
          </div>
          <button
            onClick={handleUploadClick}
            className="btn-amber h-7 text-[12px] px-3 inline-flex items-center gap-1.5"
          >
            <Upload className="w-3 h-3" />
            Upload now
          </button>
        </div>
      )}

      {showInviteBanner && (
        <div className="h-10 flex items-center justify-between px-6 bg-accent-soft border-b border-border shrink-0">
          <button
            onClick={goToInvites}
            className="text-[13px] text-foreground hover:text-amber transition-colors inline-flex items-center gap-1.5 group"
          >
            Atlas gets sharper with your team. <span className="text-text-secondary">Invite colleagues</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={() => setInviteBannerDismissed(true)}
            className="text-text-tertiary hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============ TOP NAV ============ */}
      <header
        data-shrunk={shrunk}
        className="nav-shell flex items-center justify-between px-6 border-b border-border bg-card shrink-0"
      >
        <div className="flex items-center gap-8">
          <AtlasLogo />
          {workspace && (
            <div className="hidden md:block">
              <WorkspaceSwitcher onInviteClick={goToInvites} />
            </div>
          )}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            <button onClick={() => setActiveTab("chat")} className={tabClass("chat")} data-active={activeTab === "chat"}>Chat</button>
            <button onClick={() => setActiveTab("knowledge")} className={tabClass("knowledge")} data-active={activeTab === "knowledge"}>Knowledge</button>
            <button onClick={() => setActiveTab("sources")} className={tabClass("sources")} data-active={activeTab === "sources"}>Sources</button>
            <button onClick={() => setActiveTab("team")} className={tabClass("team")} data-active={activeTab === "team"}>Team</button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={palette.show}
            className="hidden md:flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-background hover:bg-muted text-[12.5px] text-text-secondary transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            Search
            <kbd className="kbd ml-2"><Command className="w-2.5 h-2.5 inline -mt-0.5" />K</kbd>
          </button>
          <button
            onClick={() => setCalendarOpen(true)}
            aria-label="Calendar"
            className="p-2 rounded-md hover:bg-muted text-text-secondary hover:text-foreground transition-colors"
          >
            <CalendarDays className="w-4 h-4" />
          </button>
          <Link
            to="/settings"
            aria-label="Settings"
            className="p-2 rounded-md hover:bg-muted text-text-secondary hover:text-foreground transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </Link>
          <div className="w-px h-5 bg-border mx-1" />
          <AccountMenu />
        </div>
      </header>

      {/* ============ BODY: SIDEBAR + CHAT ============ */}
      <div className="flex-1 flex overflow-hidden bg-background">
        <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-border bg-sidebar">
          <div className="p-4">
            <button
              onClick={handleUploadClick}
              className={
                hasDocs
                  ? "w-full inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md border border-border bg-card hover:bg-muted text-[13px] text-foreground transition-colors"
                  : "btn-amber w-full inline-flex items-center justify-center gap-2 h-9 text-[13px]"
              }
            >
              {hasDocs ? <Plus className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
              Upload documents
            </button>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab("chat")}
                aria-label="New chat"
                title="New chat"
                className="inline-flex items-center justify-center gap-1.5 h-8 rounded-md border border-border bg-card hover:bg-muted text-[12px] text-text-secondary transition-colors"
              >
                <Plus className="w-3 h-3" /> Chat
              </button>
              <button
                onClick={() => setCollectionsOpen(true)}
                aria-label="New collection"
                title="New collection"
                className="inline-flex items-center justify-center gap-1.5 h-8 rounded-md border border-border bg-card hover:bg-muted text-[12px] text-text-secondary transition-colors"
              >
                <Plus className="w-3 h-3" /> Collection
              </button>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="text-[11px] font-mono tracking-[0.14em] text-text-tertiary mb-2">
              KNOWLEDGE · {docCount}
            </div>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {loadingDocs ? (
                <div className="text-[12px] text-text-tertiary">Loading…</div>
              ) : docCount === 0 ? (
                <div className="text-[12px] text-text-tertiary leading-[1.5]">
                  No documents yet. Atlas can only answer general questions until you upload.
                </div>
              ) : (
                documents.slice(0, 8).map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-[12.5px] text-foreground"
                  >
                    <FileText className="w-3 h-3 text-text-secondary shrink-0" strokeWidth={1.5} />
                    <span className="truncate flex-1">{d.file_name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex-1" />

          <div className="p-4 border-t border-border">
            <div className="text-[11px] font-mono tracking-[0.14em] text-text-tertiary mb-2">
              TEAM · {memberCount}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Real members — show first 4 */}
              {members.slice(0, 4).map((m) => (
                <div
                  key={m.user_id}
                  title={m.role}
                  className={`w-7 h-7 rounded-full text-[10px] font-semibold flex items-center justify-center ${
                    m.user_id === user?.id ? "bg-foreground text-background" : "bg-muted text-text-secondary border border-border"
                  }`}
                >
                  {m.user_id === user?.id ? initial : "·"}
                </div>
              ))}
              {/* Ghost slots when team is small */}
              {Array.from({ length: Math.max(0, 3 - memberCount) }).map((_, i) => (
                <button
                  key={`ghost-${i}`}
                  onClick={goToInvites}
                  className="w-7 h-7 rounded-full border border-dashed border-border bg-transparent text-text-tertiary hover:border-amber hover:text-amber transition-colors flex items-center justify-center"
                  aria-label="Invite colleague"
                >
                  <Plus className="w-3 h-3" />
                </button>
              ))}
              {memberCount === 1 && (
                <button
                  onClick={goToInvites}
                  className="ml-1 text-[12px] text-amber hover:underline"
                >
                  Invite
                </button>
              )}
            </div>
          </div>
        </aside>

        <div className="flex-1 overflow-hidden bg-background">
          {activeTab === "chat" && <AtlasChat />}
          {activeTab === "knowledge" && (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-5xl mx-auto">
                <KnowledgeView onUploadClick={handleUploadClick} />
              </div>
            </div>
          )}
          {activeTab === "sources" && (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-5xl mx-auto">
                <ConnectSources />
              </div>
            </div>
          )}
          {activeTab === "team" && (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-5xl mx-auto">
                <TeamView onInviteClick={goToInvites} />
              </div>
            </div>
          )}
        </div>
      </div>

      <CommandPalette
        open={palette.open}
        onOpenChange={palette.setOpen}
        onSelectTab={setActiveTab}
        onUpload={handleUploadClick}
        onInvite={goToInvites}
        onNewChat={() => setActiveTab("chat")}
      />

      <SoftLaunchModal
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
        featureKey="calendar"
        title="Calendar in Atlas"
        description="See your day, schedule meetings, and have Atlas prep you for each one — all from inside the app."
        shippingSignal="Launching with the Google Workspace connector. Microsoft 365 follows."
        notePlaceholder="Which calendar do you use? What would you want Atlas to do with it?"
        workspaceId={workspace?.id ?? null}
      />

      <SoftLaunchModal
        open={collectionsOpen}
        onOpenChange={setCollectionsOpen}
        featureKey="knowledge_collections"
        title="Knowledge collections"
        description="Group documents by topic, team, or client so Atlas can scope its answers to just the right context."
        shippingSignal="Coming with the next pilot release."
        workspaceId={workspace?.id ?? null}
      />
    </motion.div>
  );
};

export default Workspace;
