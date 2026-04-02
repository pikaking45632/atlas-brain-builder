import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Link2, X, Shield, Sparkles, Cake } from "lucide-react";
import AtlasLogo from "./AtlasLogo";
import { useOnboarding } from "@/store/onboarding";
import { BusinessType } from "@/data/modules";

const ease = [0.16, 1, 0.3, 1] as const;

interface Source {
  id: string;
  name: string;
  icon: string;
  color: string;
  categories: BusinessType[];
}

const allSources: Source[] = [
  { id: "google-drive", name: "Google Drive", icon: "📁", color: "from-yellow-400 to-amber-500", categories: ["General SME", "Professional Services", "Property", "Retail", "Insurance"] },
  { id: "sharepoint", name: "SharePoint", icon: "📊", color: "from-blue-500 to-blue-600", categories: ["General SME", "Professional Services", "Insurance", "Manufacturing", "Construction"] },
  { id: "notion", name: "Notion", icon: "📝", color: "from-gray-700 to-gray-900", categories: ["General SME", "Professional Services", "Retail"] },
  { id: "dropbox", name: "Dropbox", icon: "📦", color: "from-blue-400 to-blue-500", categories: ["General SME", "Professional Services", "Trades", "Property"] },
  { id: "slack", name: "Slack", icon: "💬", color: "from-purple-500 to-pink-500", categories: ["General SME", "Professional Services", "Retail", "Hospitality"] },
  { id: "teams", name: "Microsoft Teams", icon: "👥", color: "from-indigo-500 to-purple-600", categories: ["General SME", "Professional Services", "Insurance", "Manufacturing", "Construction"] },
  { id: "jira", name: "Jira", icon: "🎯", color: "from-blue-600 to-blue-700", categories: ["Professional Services", "Manufacturing", "Construction"] },
  { id: "confluence", name: "Confluence", icon: "📖", color: "from-blue-500 to-indigo-500", categories: ["Professional Services", "Insurance", "Manufacturing"] },
  { id: "xero", name: "Xero", icon: "💰", color: "from-cyan-500 to-blue-500", categories: ["General SME", "Retail", "Trades", "Property", "Hospitality", "Construction"] },
  { id: "quickbooks", name: "QuickBooks", icon: "📒", color: "from-green-500 to-green-600", categories: ["General SME", "Retail", "Trades", "Automotive"] },
  { id: "hubspot", name: "HubSpot", icon: "🧲", color: "from-orange-400 to-red-500", categories: ["General SME", "Professional Services", "Retail", "Insurance"] },
  { id: "salesforce", name: "Salesforce", icon: "☁️", color: "from-blue-400 to-cyan-400", categories: ["Insurance", "Professional Services", "Automotive", "Retail"] },
  { id: "procore", name: "Procore", icon: "🏗️", color: "from-orange-500 to-yellow-500", categories: ["Construction", "Trades", "Property"] },
  { id: "sage", name: "Sage", icon: "📈", color: "from-green-600 to-emerald-500", categories: ["Construction", "Manufacturing", "General SME", "Trades"] },
  { id: "citb", name: "CITB Portal", icon: "🔧", color: "from-teal-500 to-cyan-600", categories: ["Construction", "Trades"] },
  { id: "fleet-tracker", name: "Fleet Tracker", icon: "🚛", color: "from-red-500 to-orange-500", categories: ["Logistics", "Automotive", "Construction", "Trades"] },
  { id: "toast-pos", name: "Toast POS", icon: "🍞", color: "from-orange-400 to-red-400", categories: ["Hospitality"] },
  { id: "opentable", name: "OpenTable", icon: "🍽️", color: "from-red-500 to-red-600", categories: ["Hospitality"] },
  { id: "shopify", name: "Shopify", icon: "🛒", color: "from-green-500 to-lime-500", categories: ["Retail"] },
  { id: "autotrader", name: "AutoTrader", icon: "🚗", color: "from-yellow-500 to-orange-500", categories: ["Automotive"] },
];

const permissions = [
  { icon: "📄", text: "Read documents and files from your connected accounts" },
  { icon: "🔍", text: "Search across your sources to answer your questions" },
  { icon: "🔄", text: "Sync new documents automatically when they change" },
  { icon: "🔒", text: "Atlas will never modify, delete or share your files" },
];

const ConnectSources = () => {
  const { businessType, setStep } = useOnboarding();
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [connectedSources, setConnectedSources] = useState<string[]>([]);

  const sortedSources = [...allSources].sort((a, b) => {
    const aRelevant = businessType && a.categories.includes(businessType);
    const bRelevant = businessType && b.categories.includes(businessType);
    if (aRelevant && !bRelevant) return -1;
    if (!aRelevant && bRelevant) return 1;
    return 0;
  });

  const handleConnect = (source: Source) => setSelectedSource(source);
  const confirmConnect = () => {
    if (selectedSource) {
      setConnectedSources((prev) => [...prev, selectedSource.id]);
      setSelectedSource(null);
    }
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

      <div className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-4xl space-y-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }} className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto shadow-[0_0_40px_-8px_hsl(160_70%_50%/0.4)]">
              <Link2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">Connect Your Sources</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Link the tools you already use. Atlas will learn from them.
            </p>
            {businessType && (
              <div className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                Recommended for {businessType}
              </div>
            )}
          </motion.div>

          {/* Source grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {sortedSources.map((source, i) => {
              const isConnected = connectedSources.includes(source.id);
              const isRelevant = businessType && source.categories.includes(businessType);
              return (
                <motion.button
                  key={source.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, ease }}
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => !isConnected && handleConnect(source)}
                  className={`relative flex flex-col items-center gap-2.5 p-5 rounded-xl border transition-all duration-300 ${
                    isConnected
                      ? "border-primary/40 bg-primary/5 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.2)]"
                      : isRelevant
                      ? "border-primary/20 bg-card/50 hover:border-primary/40 hover:bg-card/80"
                      : "border-border/30 bg-card/30 hover:border-border/50 hover:bg-card/60"
                  }`}
                >
                  {isConnected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  {isRelevant && !isConnected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                  <span className="text-2xl">{source.icon}</span>
                  <span className="text-xs font-medium text-foreground/80 text-center leading-tight">{source.name}</span>
                </motion.button>
              );
            })}
          </motion.div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(8)} className="btn-ghost h-[48px] px-6 text-sm flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setStep(7)} className="btn-primary h-[48px] px-8 text-sm">
              {connectedSources.length > 0 ? `Continue (${connectedSources.length} connected)` : "Skip for now"}
            </button>
          </div>
        </div>
      </div>

      {/* Auth dialog */}
      <AnimatePresence>
        {selectedSource && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setSelectedSource(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="w-full max-w-md glass-card p-6 space-y-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedSource.color} flex items-center justify-center text-xl shadow-lg`}>
                    {selectedSource.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-foreground">Authorise {selectedSource.name}</h3>
                    <p className="text-sm text-muted-foreground">Atlas Intelligence Systems</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSource(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  Atlas is requesting permission to:
                </div>
                <div className="space-y-2">
                  {permissions.map((perm, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/20">
                      <span className="text-base shrink-0">{perm.icon}</span>
                      <span className="text-sm text-foreground/80">{perm.text}</span>
                    </div>
                  ))}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-dashed border-border/30">
                    <Cake className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground italic">Atlas cannot bake you a cake 🎂 …yet</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="btn-ghost flex-1 h-[44px] text-sm" onClick={() => setSelectedSource(null)}>Cancel</button>
                <button className="btn-primary flex-1 h-[44px] text-sm flex items-center justify-center gap-2" onClick={confirmConnect}>
                  <CheckCircle2 className="w-4 h-4" />
                  Authorise
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ConnectSources;
