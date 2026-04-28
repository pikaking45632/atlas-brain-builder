import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CalendarDays,
  Settings,
  Command,
  Upload,
  Users,
  X,
  Plus,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { getBackendClient } from "@/lib/backend";
import { useToast } from "@/hooks/use-toast";
import AtlasLogo from "@/components/atlas/AtlasLogo";
import AtlasChat from "@/components/atlas/AtlasChat";

const Workspace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { companyName, hasUploadedDocuments, invitesSentCount, markUploaded } = useOnboarding();
  const [shrunk, setShrunk] = useState(false);
  const [inviteBannerDismissed, setInviteBannerDismissed] = useState(false);

  // Documents from Supabase
  const [documents, setDocuments] = useState<Array<{ id: string; file_name: string; file_size: number | null }>>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Sticky-nav scroll-shrink
  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Load documents on mount + after upload
  const refreshDocuments = async () => {
    const client = getBackendClient();
    if (!client) { setLoadingDocs(false); return; }
    try {
      const { data: { user } } = await client.auth.getUser();
      if (!user) { setLoadingDocs(false); return; }
      const { data } = await client
        .from("documents")
        .select("id, file_name, file_size")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setDocuments(data || []);
      if ((data || []).length > 0) markUploaded();
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    refreshDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const docCount = documents.length;
  const hasDocs = docCount > 0;
  const hasEnoughInvites = invitesSentCount >= 3;

  // Invite banner reappears each session — dismissed flag is local-state only.
  const showInviteBanner = !hasEnoughInvites && !inviteBannerDismissed;

  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.pptx,.md";
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (!target.files?.length) return;
      const client = getBackendClient();
      if (!client) {
        toast({ title: "Backend unavailable", variant: "destructive" });
        return;
      }
      const { data: { user } } = await client.auth.getUser();
      if (!user) return;
      let uploaded = 0;
      for (const file of Array.from(target.files)) {
        try {
          const filePath = `${user.id}/${Date.now()}-${file.name}`;
          const { error: upErr } = await client.storage.from("documents").upload(filePath, file);
          if (upErr) throw upErr;
          await client.from("documents").insert({
            user_id: user.id,
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
    // Push the user back into the invite step. We bump the step counter so
    // GetStarted re-renders InviteColleagues, but flag the "from-workspace"
    // origin so it returns here when complete.
    sessionStorage.setItem("invite_return_to", "/app");
    navigate("/get-started");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen h-screen flex flex-col bg-background"
    >
      {/* ============ ACTIVATION BANNER STACK ============ */}
      {/* Upload banner — non-dismissable until at least one document exists. */}
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

      {/* Invite banner — dismissable per session, reappears next visit until 3 invites sent. */}
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
          <nav className="hidden md:flex items-center gap-1 ml-2">
            <a className="nav-pill text-[13px] text-foreground" data-active="true">Chat</a>
            <a className="nav-pill text-[13px] text-text-secondary hover:text-foreground transition-colors cursor-pointer">Knowledge</a>
            <a className="nav-pill text-[13px] text-text-secondary hover:text-foreground transition-colors cursor-pointer">Sources</a>
            <a className="nav-pill text-[13px] text-text-secondary hover:text-foreground transition-colors cursor-pointer">Team</a>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button className="hidden md:flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-background hover:bg-muted text-[12.5px] text-text-secondary transition-colors">
            <Search className="w-3.5 h-3.5" />
            Search
            <kbd className="kbd ml-2"><Command className="w-2.5 h-2.5 inline -mt-0.5" />K</kbd>
          </button>
          {[CalendarDays, Settings].map((Icon, i) => (
            <button key={i} className="p-2 rounded-md hover:bg-muted text-text-secondary hover:text-foreground transition-colors">
              <Icon className="w-4 h-4" />
            </button>
          ))}
          <div className="w-px h-5 bg-border mx-1" />
          <div className="w-8 h-8 rounded-md flex items-center justify-center text-[12px] font-semibold text-accent-foreground bg-foreground">
            {companyName?.[0]?.toUpperCase() || "A"}
          </div>
        </div>
      </header>

      {/* ============ BODY: SIDEBAR + CHAT ============ */}
      <div className="flex-1 flex overflow-hidden bg-background">
        {/* Sidebar — persistent activation affordances */}
        <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-border bg-sidebar">
          {/* Upload — amber when zero docs, ghost when docs exist */}
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
          </div>

          {/* Document list */}
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

          {/* Spacer */}
          <div className="flex-1" />

          {/* Team footer — always visible */}
          <div className="p-4 border-t border-border">
            <div className="text-[11px] font-mono tracking-[0.14em] text-text-tertiary mb-2">
              TEAM · {Math.max(invitesSentCount + 1, 1)}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-foreground text-[10px] font-semibold text-background flex items-center justify-center">
                {companyName?.[0]?.toUpperCase() || "A"}
              </div>
              {/* Ghost avatars for empty slots */}
              {Array.from({ length: Math.min(2, Math.max(0, 3 - invitesSentCount)) }).map((_, i) => (
                <button
                  key={i}
                  onClick={goToInvites}
                  className="w-7 h-7 rounded-full border border-dashed border-border bg-transparent text-text-tertiary hover:border-amber hover:text-amber transition-colors flex items-center justify-center"
                  aria-label="Invite colleague"
                >
                  <Plus className="w-3 h-3" />
                </button>
              ))}
              {invitesSentCount === 0 && (
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

        {/* Chat surface */}
        <div className="flex-1 overflow-hidden bg-background">
          <AtlasChat />
        </div>
      </div>
    </motion.div>
  );
};

export default Workspace;
