import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, X, Shield, Sparkles,
  FolderOpen, FileSpreadsheet, FileText, Package, MessageCircle, Users,
  Target, BookOpen, Calculator, Receipt, Magnet, Cloud, Construction, Banknote,
  Wrench, Truck, Pizza, UtensilsCrossed, ShoppingBag, Car, Check, Database,
} from "lucide-react";
import AtlasLogo from "./AtlasLogo";
import DrawCheck from "./DrawCheck";
import MagneticButton from "./MagneticButton";
import { useOnboarding } from "@/store/onboarding";
import { BusinessType } from "@/data/modules";

const ease = [0.16, 1, 0.3, 1] as const;

interface Source {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  categories: BusinessType[];
}

const allSources: Source[] = [
  { id: "google-drive",  name: "Google Drive",     icon: FolderOpen,         categories: ["General SME", "Professional Services", "Property", "Retail", "Insurance"] },
  { id: "sharepoint",    name: "SharePoint",       icon: FileSpreadsheet,    categories: ["General SME", "Professional Services", "Insurance", "Manufacturing", "Construction"] },
  { id: "notion",        name: "Notion",           icon: FileText,           categories: ["General SME", "Professional Services", "Retail"] },
  { id: "dropbox",       name: "Dropbox",          icon: Package,            categories: ["General SME", "Professional Services", "Trades", "Property"] },
  { id: "slack",         name: "Slack",            icon: MessageCircle,      categories: ["General SME", "Professional Services", "Retail", "Hospitality"] },
  { id: "teams",         name: "Microsoft Teams",  icon: Users,              categories: ["General SME", "Professional Services", "Insurance", "Manufacturing", "Construction"] },
  { id: "jira",          name: "Jira",             icon: Target,             categories: ["Professional Services", "Manufacturing", "Construction"] },
  { id: "confluence",    name: "Confluence",       icon: BookOpen,           categories: ["Professional Services", "Insurance", "Manufacturing"] },
  { id: "xero",          name: "Xero",             icon: Calculator,         categories: ["General SME", "Retail", "Trades", "Property", "Hospitality", "Construction"] },
  { id: "quickbooks",    name: "QuickBooks",       icon: Receipt,            categories: ["General SME", "Retail", "Trades", "Automotive"] },
  { id: "hubspot",       name: "HubSpot",          icon: Magnet,             categories: ["General SME", "Professional Services", "Retail", "Insurance"] },
  { id: "salesforce",    name: "Salesforce",       icon: Cloud,              categories: ["Insurance", "Professional Services", "Automotive", "Retail"] },
  { id: "procore",       name: "Procore",          icon: Construction,       categories: ["Construction", "Trades", "Property"] },
  { id: "sage",          name: "Sage",             icon: Banknote,           categories: ["Construction", "Manufacturing", "General SME", "Trades"] },
  { id: "citb",          name: "CITB Portal",      icon: Wrench,             categories: ["Construction", "Trades"] },
  { id: "fleet-tracker", name: "Fleet Tracker",    icon: Truck,              categories: ["Logistics", "Automotive", "Construction", "Trades"] },
  { id: "toast-pos",     name: "Toast POS",        icon: Pizza,              categories: ["Hospitality"] },
  { id: "opentable",     name: "OpenTable",        icon: UtensilsCrossed,    categories: ["Hospitality"] },
  { id: "shopify",       name: "Shopify",          icon: ShoppingBag,        categories: ["Retail"] },
  { id: "autotrader",    name: "AutoTrader",       icon: Car,                categories: ["Automotive"] },
];

const permissions = [
  "Read documents and files from your connected accounts",
  "Search across your sources to answer your questions",
  "Sync new documents automatically when they change",
  "Atlas will never modify, delete, or share your files",
];

const ConnectSources = () => {
  const { businessType, setStep } = useOnboarding();
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [connectedSources, setConnectedSources] = useState<string[]>([]);

  const sortedSources = [...allSources].sort((a, b) => {
    const aRel = businessType && a.categories.includes(businessType);
    const bRel = businessType && b.categories.includes(businessType);
    if (aRel && !bRel) return -1;
    if (!aRel && bRel) return 1;
    return 0;
  });

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
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease }}
      className="min-h-screen flex flex-col bg-background"
    >
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-border">
        <AtlasLogo />
        <button onClick={() => setStep(11)} className="text-[13px] text-muted-foreground hover:text-foreground link-underline">
          Back to dashboard
        </button>
      </header>

      <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-10 py-16 lg:py-20 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="grid lg:grid-cols-12 gap-8 items-end"
        >
          <div className="lg:col-span-7">
            <span className="eyebrow inline-flex items-center gap-2">
              <Database className="w-3 h-3" strokeWidth={1.5} />
              ENRICH · SOURCES
            </span>
            <h1 className="mt-4 text-[44px] sm:text-[52px] font-display font-bold text-foreground leading-[1.05] tracking-[-0.03em]">
              Connect<br />your tools.
            </h1>
          </div>
          <p className="lg:col-span-5 text-[15px] leading-[1.65] text-muted-foreground">
            Wire in the systems Atlas should learn from. We'll keep them in
            sync — you don't lift a finger after this.
            {businessType && (
              <span className="block mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] uppercase text-accent">
                <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                Recommended for {businessType}
              </span>
            )}
          </p>
        </motion.div>

        {/* Source grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        >
          {sortedSources.map((source, i) => {
            const Icon = source.icon;
            const isConnected = connectedSources.includes(source.id);
            const isRelevant = businessType && source.categories.includes(businessType);
            return (
              <motion.button
                key={source.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.4, ease }}
                onClick={() => !isConnected && setSelectedSource(source)}
                className={`relative flex flex-col items-center gap-3 py-6 px-4 rounded-[10px] border bg-card transition-all duration-200 group ${
                  isConnected
                    ? "border-accent shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                    : "border-border hover:border-foreground/20 hover:-translate-y-[2px] hover:shadow-card-hover"
                }`}
              >
                {isConnected && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                    <DrawCheck size={11} colorClass="text-accent-foreground" stroke={2.5} />
                  </span>
                )}
                {isRelevant && !isConnected && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />
                )}
                <Icon className={`w-6 h-6 ${isConnected ? "text-accent" : "text-foreground/60 group-hover:text-foreground"}`} strokeWidth={1.5} />
                <span className="text-[12.5px] font-medium text-foreground text-center leading-tight">
                  {source.name}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        <div className="flex items-center gap-3 pt-4">
          <button onClick={() => setStep(11)} className="btn-ghost h-[48px] px-5 text-[14px] flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <MagneticButton onClick={() => setStep(11)} className="btn-primary h-[48px] px-7 flex items-center gap-2 group">
            {connectedSources.length > 0 ? `Continue · ${connectedSources.length} connected` : "Skip for now"}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </MagneticButton>
        </div>
      </div>

      {/* Auth dialog */}
      <AnimatePresence>
        {selectedSource && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
            onClick={() => setSelectedSource(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease }}
              className="w-full max-w-md rounded-[12px] border border-border bg-card shadow-card-hover"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center">
                    <selectedSource.icon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Authorise {selectedSource.name}</h3>
                    <p className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">Atlas Intelligence Systems</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSource(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-[12.5px] font-medium text-foreground">
                  <Shield className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                  Atlas is requesting permission to:
                </div>
                <ul className="space-y-2">
                  {permissions.map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] text-foreground/85">
                      <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" strokeWidth={2.25} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 p-5 pt-0">
                <button className="btn-ghost flex-1 h-[42px] text-[13.5px]" onClick={() => setSelectedSource(null)}>
                  Cancel
                </button>
                <button
                  className="btn-primary flex-1 h-[42px] text-[13.5px] inline-flex items-center justify-center gap-2"
                  onClick={confirmConnect}
                >
                  <Check className="w-3.5 h-3.5" />
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
