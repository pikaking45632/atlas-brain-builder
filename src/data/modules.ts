import {
  Scale, Users, Shield, Car, Truck, HardHat, FileText, AlertTriangle,
  CheckCircle, ShoppingCart, Calculator, HeadphonesIcon, TrendingUp,
  Settings, FolderKanban, Lock, Monitor, GraduationCap, Package,
  ClipboardList
} from "lucide-react";

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: ModuleCategory;
}

export type ModuleCategory = "Legal" | "HR" | "Finance" | "Operations" | "Compliance" | "Sector-specific";

export type BusinessType =
  | "Construction" | "Insurance" | "Professional Services" | "Trades"
  | "Property" | "Automotive" | "Retail" | "Logistics"
  | "Hospitality" | "Manufacturing" | "General SME";

export const modules: Module[] = [
  { id: "employment-law", title: "Employment Law", description: "UK employment legislation and tribunal guidance", icon: Scale, category: "Legal" },
  { id: "hr-policies", title: "HR Policies", description: "Staff handbooks, absence, disciplinary and grievance", icon: Users, category: "HR" },
  { id: "contracts", title: "Contracts", description: "Contract templates, terms, and clause libraries", icon: FileText, category: "Legal" },
  { id: "health-safety", title: "Health & Safety", description: "Risk frameworks, method statements and CDM", icon: Shield, category: "Compliance" },
  { id: "risk-assessments", title: "Risk Assessments", description: "Hazard identification and mitigation planning", icon: AlertTriangle, category: "Compliance" },
  { id: "car-insurance", title: "Car Insurance", description: "Motor policy, claims handling and underwriting", icon: Car, category: "Sector-specific" },
  { id: "fleet-management", title: "Fleet Management", description: "Vehicle tracking, maintenance and compliance", icon: Truck, category: "Sector-specific" },
  { id: "quantity-surveying", title: "Quantity Surveying", description: "Cost estimation, BOQs, and valuations", icon: HardHat, category: "Sector-specific" },
  { id: "supplier-management", title: "Supplier Management", description: "Vendor onboarding, performance and contracts", icon: Package, category: "Operations" },
  { id: "procurement", title: "Procurement", description: "Purchase orders, tendering and sourcing", icon: ShoppingCart, category: "Operations" },
  { id: "gdpr", title: "Data Protection / GDPR", description: "Privacy policies, DPIAs and subject access requests", icon: Lock, category: "Compliance" },
  { id: "finance", title: "Bookkeeping & Finance", description: "Invoicing, expenses, VAT and payroll basics", icon: Calculator, category: "Finance" },
  { id: "sales", title: "Sales Processes", description: "Pipeline management, proposals and CRM workflows", icon: TrendingUp, category: "Operations" },
  { id: "customer-service", title: "Customer Service", description: "Complaint handling, SLAs and satisfaction tracking", icon: HeadphonesIcon, category: "Operations" },
  { id: "sops", title: "Internal SOPs", description: "Standard operating procedures and process maps", icon: ClipboardList, category: "Operations" },
  { id: "training", title: "Training & Onboarding", description: "Staff induction, skills tracking and CPD records", icon: GraduationCap, category: "HR" },
  { id: "project-management", title: "Project Management", description: "Timelines, milestones, Gantt charts and reporting", icon: FolderKanban, category: "Operations" },
  { id: "compliance", title: "Compliance Management", description: "Regulatory tracking, audits and certifications", icon: CheckCircle, category: "Compliance" },
  { id: "cyber-security", title: "Cyber Security", description: "IT policies, phishing awareness and incident response", icon: Monitor, category: "Compliance" },
  { id: "incident-reporting", title: "Incident Reporting", description: "Near-miss logging, RIDDOR and investigation workflows", icon: Settings, category: "Compliance" },
];

export const categoryFilters: ModuleCategory[] = ["Legal", "HR", "Finance", "Operations", "Compliance", "Sector-specific"];

export const recommendations: Record<BusinessType, string[]> = {
  Construction: ["quantity-surveying", "health-safety", "risk-assessments", "procurement", "contracts", "project-management", "supplier-management", "compliance"],
  Insurance: ["car-insurance", "contracts", "gdpr", "compliance", "customer-service", "finance", "cyber-security", "sops"],
  "Professional Services": ["employment-law", "hr-policies", "contracts", "gdpr", "finance", "training", "project-management", "cyber-security"],
  Trades: ["health-safety", "risk-assessments", "contracts", "finance", "procurement", "sops", "compliance", "supplier-management"],
  Property: ["contracts", "compliance", "finance", "gdpr", "risk-assessments", "project-management", "procurement", "supplier-management"],
  Automotive: ["car-insurance", "fleet-management", "health-safety", "customer-service", "sales", "supplier-management", "sops", "compliance"],
  Retail: ["customer-service", "sales", "finance", "sops", "hr-policies", "training", "gdpr", "procurement"],
  Logistics: ["fleet-management", "health-safety", "supplier-management", "procurement", "sops", "compliance", "risk-assessments", "project-management"],
  Hospitality: ["health-safety", "hr-policies", "training", "customer-service", "finance", "compliance", "sops", "gdpr"],
  Manufacturing: ["health-safety", "risk-assessments", "procurement", "supplier-management", "compliance", "sops", "project-management", "incident-reporting"],
  "General SME": ["employment-law", "hr-policies", "finance", "gdpr", "contracts", "sops", "compliance", "customer-service"],
};

export const businessTypes: { label: BusinessType; icon: any; description: string }[] = [
  { label: "Construction", icon: HardHat, description: "Building, civil engineering & trades" },
  { label: "Insurance", icon: Shield, description: "Brokers, underwriters & claims" },
  { label: "Professional Services", icon: Scale, description: "Consulting, legal & accountancy" },
  { label: "Trades", icon: Settings, description: "Electrical, plumbing & mechanical" },
  { label: "Property", icon: FolderKanban, description: "Lettings, estate agents & management" },
  { label: "Automotive", icon: Car, description: "Dealerships, garages & fleet" },
  { label: "Retail", icon: ShoppingCart, description: "Shops, e-commerce & wholesale" },
  { label: "Logistics", icon: Truck, description: "Transport, warehousing & distribution" },
  { label: "Hospitality", icon: HeadphonesIcon, description: "Hotels, restaurants & catering" },
  { label: "Manufacturing", icon: Package, description: "Production, assembly & processing" },
  { label: "General SME", icon: TrendingUp, description: "Multi-sector small business" },
];
