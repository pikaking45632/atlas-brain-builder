import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, ArrowRight, FileUp } from "lucide-react";
import AtlasLogo from "./AtlasLogo";
import DrawCheck from "./DrawCheck";
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
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-border bg-card">
        <AtlasLogo />
        <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          Step 02 / 03 · Documents
        </span>
      </header>

      <div className="flex-1 flex items-start justify-center px-6 py-16 lg:py-24">
        <div className="w-full max-w-[640px]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <h1 className="font-display text-[36px] sm:text-[40px] leading-[1.08] tracking-[-0.02em] text-foreground">
              Atlas gets smarter the moment you upload your first document.
            </h1>
            <p className="mt-4 text-[15px] leading-[1.55] text-muted-foreground">
              Drop in handbooks, policies, SOPs — anything your team would normally have to ask for. Atlas reads it once and remembers.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={openPicker}
            className={`mt-8 w-full h-[240px] rounded-[16px] border-2 border-dashed flex flex-col items-center justify-center text-center px-6 transition-colors duration-150 ease-out cursor-pointer ${
              dragActive
                ? "border-amber bg-amber-soft"
                : "border-[hsl(var(--amber)/0.4)] bg-card hover:bg-amber-soft"
            }`}
          >
            <FileUp className={`w-8 h-8 mb-4 ${dragActive ? "text-amber" : "text-[hsl(var(--amber)/0.7)]"}`} strokeWidth={1.5} />
            <p className="text-[15px] font-medium text-foreground">
              Drag PDFs, Word docs, or text files
            </p>
            <p className="mt-1 text-[13px] text-text-secondary">
              Or click to browse
            </p>
          </motion.button>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-muted-foreground mr-1">Try uploading:</span>
            {["Employee handbook", "Sales playbook", "Process docs"].map((c) => (
              <span
                key={c}
                className="inline-flex items-center h-7 px-2.5 rounded-md border border-border bg-card text-[12px] text-text-secondary"
              >
                {c}
              </span>
            ))}
          </div>

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 rounded-[12px] border border-border bg-card overflow-hidden"
              >
                {files.map((file, i) => (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className={`flex items-center gap-3 px-4 py-3 ${i !== files.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <FileText className="w-4 h-4 text-text-secondary shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-foreground truncate">{file.name}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="font-mono text-[11px] text-text-tertiary">{formatSize(file.size)}</span>
                        {file.status === "uploading" && (
                          <span className="font-mono text-[11px] text-text-secondary">· Indexing…</span>
                        )}
                        {file.status === "done" && (
                          <span className="font-mono text-[11px] text-[hsl(var(--success))]">· Ready</span>
                        )}
                        {file.status === "error" && (
                          <span className="font-mono text-[11px] text-destructive">· Failed</span>
                        )}
                      </div>
                      {file.status === "uploading" && (
                        <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full bg-accent"
                            initial={{ width: "10%" }}
                            animate={{ width: ["10%", "85%"] }}
                            transition={{ duration: 1.4, ease: "easeOut" }}
                          />
                        </div>
                      )}
                    </div>
                    {file.status === "done" && (
                      <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <DrawCheck size={12} colorClass="text-accent-foreground" stroke={2.5} />
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                      className="text-text-tertiary hover:text-foreground transition-colors"
                      aria-label="Remove"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={() => setStep(10)}
              className="text-[13px] text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={() => setStep(10)}
              className="btn-amber inline-flex items-center gap-2 group"
            >
              {files.length > 0 ? `Continue with ${files.length} document${files.length > 1 ? "s" : ""}` : "Continue to team"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadDocuments;
