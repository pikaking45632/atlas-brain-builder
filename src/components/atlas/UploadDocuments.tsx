import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle2, ArrowLeft, Cloud } from "lucide-react";
import AtlasLogo from "./AtlasLogo";
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
          prev.map((f) => (f.name === file.name && f.status === "uploading" ? { ...f, status: "done", path: filePath } : f))
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) => (f.name === file.name && f.status === "uploading" ? { ...f, status: "error" } : f))
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.5, ease }}
      className="min-h-screen flex flex-col"
    >
      <header className="flex items-center px-8 py-6">
        <AtlasLogo />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }} className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto shadow-[0_0_40px_-8px_hsl(200_80%_60%/0.4)]">
              <Cloud className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">Upload Documents</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Feed Atlas with your company policies, handbooks, and procedures.
            </p>
          </motion.div>

          {/* Drop zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-14 text-center transition-all duration-300 cursor-pointer ${
              dragActive
                ? "border-primary/60 bg-primary/5 shadow-[0_0_40px_-8px_hsl(var(--primary)/0.2)]"
                : "border-border/40 hover:border-primary/30 bg-card/30"
            }`}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.multiple = true;
              input.accept = ".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.pptx,.md";
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files?.length) handleUpload(target.files);
              };
              input.click();
            }}
          >
            <Upload className={`w-10 h-10 mx-auto mb-4 transition-colors duration-300 ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-foreground font-semibold mb-1">Drop files here or click to browse</p>
            <p className="text-sm text-muted-foreground">PDF, DOC, DOCX, TXT, CSV, XLSX, PPTX, MD</p>
          </motion.div>

          {/* File list */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                {files.map((file) => (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-3 rounded-xl glass-card"
                  >
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                    </div>
                    {file.status === "uploading" && (
                      <motion.div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
                    )}
                    {file.status === "done" && <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
                    {file.status === "error" && <span className="text-xs text-destructive font-medium">Failed</span>}
                    <button onClick={(e) => { e.stopPropagation(); removeFile(file.name); }} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(8)} className="btn-ghost h-[48px] px-6 text-sm flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setStep(8)} className="btn-primary h-[48px] px-8 text-sm">
              {files.length > 0 ? "Continue" : "Skip for now"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadDocuments;
