import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, ArrowLeft, ArrowRight } from "lucide-react";
import AtlasLogo from "./AtlasLogo";
import DrawCheck from "./DrawCheck";
import MagneticButton from "./MagneticButton";
import { useOnboarding } from "@/store/onboarding";
import { getBackendClient } from "@/lib/backend";

const ease = [0.16, 1, 0.3, 1] as const;

interface UploadedFile {
  name: string;
  size: number;
  status: "uploading" | "done" | "error";
  path?: string;
}

const UploadDocuments = () => {
  const { setStep } = useOnboarding();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = useCallback(async (fileList: FileList) => {
    const client = getBackendClient();
    const newFiles = Array.from(fileList);
    for (const file of newFiles) {
      const entry: UploadedFile = { name: file.name, size: file.size, status: "uploading" };
      setFiles((prev) => [...prev, entry]);
      try {
        if (!client) throw new Error("Backend unavailable");
        const userId = (await client.auth.getUser()).data.user?.id;
        if (!userId) throw new Error("Not authenticated");
        const filePath = `${userId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await client.storage.from("documents").upload(filePath, file);
        if (uploadError) throw uploadError;
        await client.from("documents").insert({
          user_id: userId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
        });
        setFiles((prev) =>
          prev.map((f) => (f.name === file.name && f.status === "uploading" ? { ...f, status: "done", path: filePath } : f)),
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) => (f.name === file.name && f.status === "uploading" ? { ...f, status: "error" } : f)),
        );
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  const removeFile = (name: string) => setFiles((prev) => prev.filter((f) => f.name !== name));

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const openPicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.pptx,.md";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.length) handleUpload(target.files);
    };
    input.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-border">
        <AtlasLogo />
        <button
          onClick={() => setStep(8)}
          className="text-[13px] text-muted-foreground hover:text-foreground link-underline"
        >
          Back to dashboard
        </button>
      </header>

      <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-10 py-16 lg:py-20 grid lg:grid-cols-12 gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="lg:col-span-5"
        >
          <span className="eyebrow">ENRICH · DOCUMENTS</span>
          <h1 className="mt-4 text-[44px] sm:text-[52px] font-display font-bold text-foreground leading-[1.05] tracking-[-0.03em]">
            Upload<br />your knowledge.
          </h1>
          <p className="mt-5 text-[16px] leading-[1.65] text-muted-foreground max-w-[420px]">
            Drop in handbooks, policies, contracts, SOPs — anything written.
            Atlas reads it once and remembers forever.
          </p>
          <div className="mt-8 space-y-2 text-[13px] text-muted-foreground">
            <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-accent" /> Encrypted at rest, never shared.</div>
            <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-accent" /> Re-indexed automatically when files change.</div>
            <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-accent" /> Searchable from chat the moment upload completes.</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease }}
          className="lg:col-span-7 space-y-5"
        >
          <button
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={openPicker}
            className={`w-full rounded-[12px] border-2 border-dashed p-12 text-center transition-all duration-200 cursor-pointer ${
              dragActive
                ? "border-accent bg-accent/[0.04]"
                : "border-border hover:border-foreground/30 bg-card"
            }`}
          >
            <Upload className={`w-7 h-7 mx-auto mb-4 ${dragActive ? "text-accent" : "text-foreground/50"}`} strokeWidth={1.5} />
            <p className="text-[15px] font-semibold text-foreground">Drop files here, or click to browse</p>
            <p className="mt-1.5 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
              PDF · DOC · DOCX · TXT · CSV · XLSX · PPTX · MD
            </p>
          </button>

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-[12px] border border-border bg-card overflow-hidden">
                {files.map((file, i) => (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className={`flex items-center gap-3 px-4 py-3 ${i !== files.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <FileText className="w-4 h-4 text-foreground/60 shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-medium text-foreground truncate">{file.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{formatSize(file.size)}</p>
                    </div>
                    {file.status === "uploading" && (
                      <span className="typing-dots"><span /><span /><span /></span>
                    )}
                    {file.status === "done" && (
                      <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                        <DrawCheck size={12} colorClass="text-accent-foreground" stroke={2.5} />
                      </span>
                    )}
                    {file.status === "error" && (
                      <span className="font-mono text-[11px] text-destructive">FAILED</span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={() => setStep(8)} className="btn-ghost h-[48px] px-5 text-[14px] flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <MagneticButton onClick={() => setStep(8)} className="btn-primary h-[48px] px-7 flex items-center gap-2 group">
              {files.length > 0 ? `Continue · ${files.length} uploaded` : "Skip for now"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UploadDocuments;
