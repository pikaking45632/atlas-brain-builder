import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Link2, X, Shield, Sparkles, Cake } from "lucide-react";
import AtlasLogo from "./AtlasLogo";
import { useOnboarding } from "@/store/onboarding";
import { Button } from "@/components/ui/button";
import { BusinessType } from "@/data/modules";

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

  // Sort: relevant sources first, then others
  const sortedSources = [...allSources].sort((a, b) => {
    const aRelevant = businessType && a.categories.includes(businessType);
    const bRelevant = businessType && b.categories.includes(businessType);
    if (aRelevant && !bRelevant) return -1;
    if (!aRelevant && bRelevant) return 1;
    return 0;
  });

  const handleConnect = (source: Source) => {
    setSelectedSource(source);
  };

  const confirmConnect = () => {
    if (selectedSource) {
      setConnectedSources((prev) => [...prev, selectedSource.id]);
      setSelectedSource(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <AtlasLogo />
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-4xl space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-lg">
              <Link2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">Connect Your Sources</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Link the tools you already use. Atlas will learn from them to give you smarter answers.
            </p>
            {businessType && (
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Recommended for {businessType}
              </div>
            )}
          </motion.div>

          {/* Source grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {sortedSources.map((source) => {
              const isConnected = connectedSources.includes(source.id);
              const isRelevant = businessType && source.categories.includes(businessType);
              return (
                <motion.button
                  key={source.id}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => !isConnected && handleConnect(source)}
                  className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border transition-all ${
                    isConnected
                      ? "bg-primary/5 border-primary/30"
                      : isRelevant
                      ? "bg-card border-primary/20 hover:border-primary/40 hover:shadow-md"
                      : "bg-card border-border hover:border-border hover:shadow-sm"
                  }`}
                >
                  {isConnected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  {isRelevant && !isConnected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                  )}
                  <span className="text-2xl">{source.icon}</span>
                  <span className="text-xs font-medium text-foreground text-center leading-tight">{source.name}</span>
                </motion.button>
              );
            })}
          </motion.div>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setStep(7)} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={() => setStep(7)}>
              {connectedSources.length > 0 ? `Continue (${connectedSources.length} connected)` : "Skip for now"}
            </Button>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
            onClick={() => setSelectedSource(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-6"
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
                <button onClick={() => setSelectedSource(null)} className="text-muted-foreground hover:text-foreground">
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
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                      <span className="text-base shrink-0">{perm.icon}</span>
                      <span className="text-sm text-foreground">{perm.text}</span>
                    </div>
                  ))}
                  {/* Playful note */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-dashed border-border">
                    <Cake className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground italic">Atlas cannot bake you a cake 🎂 …yet</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedSource(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 gap-2" onClick={confirmConnect}>
                  <CheckCircle2 className="w-4 h-4" />
                  Authorise
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ConnectSources;
