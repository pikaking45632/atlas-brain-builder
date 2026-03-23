import {
  HardHat, Shield, Scale, Settings, FolderKanban, Car, ShoppingCart, Truck,
  HeadphonesIcon, Package, TrendingUp, FileText, Users, Calculator,
  AlertTriangle, ClipboardList, CheckCircle, Lock, Wrench, Building2,
  BarChart3, Calendar, MessageSquare, Target, Briefcase, Receipt
} from "lucide-react";
import { BusinessType } from "./modules";

export interface DashboardWidget {
  title: string;
  description: string;
  icon: any;
  color: string;
  size: "small" | "large";
}

export interface DashboardTheme {
  greeting: string;
  accent: string;
  accentLight: string;
  widgets: DashboardWidget[];
}

export const dashboardThemes: Record<BusinessType, DashboardTheme> = {
  Construction: {
    greeting: "Ready to build something great",
    accent: "from-orange-500 to-amber-500",
    accentLight: "bg-orange-500/10",
    widgets: [
      { title: "Site Safety", description: "RAMS and risk assessments", icon: AlertTriangle, color: "from-red-500 to-orange-500", size: "large" },
      { title: "Project Tracker", description: "Active sites and milestones", icon: FolderKanban, color: "from-blue-500 to-cyan-500", size: "large" },
      { title: "Subcontractor Hub", description: "Manage your supply chain", icon: Users, color: "from-violet-500 to-purple-500", size: "small" },
      { title: "Cost Reports", description: "Budget vs actual", icon: Calculator, color: "from-green-500 to-emerald-500", size: "small" },
      { title: "CDM Compliance", description: "Regulatory requirements", icon: Shield, color: "from-teal-500 to-cyan-500", size: "small" },
      { title: "Site Documents", description: "Plans, specs, drawings", icon: FileText, color: "from-amber-500 to-yellow-500", size: "small" },
    ],
  },
  Insurance: {
    greeting: "Your claims intelligence is active",
    accent: "from-blue-600 to-indigo-600",
    accentLight: "bg-blue-600/10",
    widgets: [
      { title: "Claims Dashboard", description: "Open, pending and resolved", icon: ClipboardList, color: "from-blue-500 to-indigo-500", size: "large" },
      { title: "Policy Library", description: "Terms, conditions and exclusions", icon: FileText, color: "from-violet-500 to-purple-500", size: "large" },
      { title: "Risk Analysis", description: "Underwriting intelligence", icon: BarChart3, color: "from-cyan-500 to-blue-500", size: "small" },
      { title: "Compliance", description: "FCA and regulatory updates", icon: Shield, color: "from-red-500 to-pink-500", size: "small" },
      { title: "Client Portal", description: "Customer communications", icon: MessageSquare, color: "from-green-500 to-emerald-500", size: "small" },
      { title: "Renewals", description: "Upcoming policy renewals", icon: Calendar, color: "from-amber-500 to-orange-500", size: "small" },
    ],
  },
  "Professional Services": {
    greeting: "Your consultancy AI is ready",
    accent: "from-indigo-500 to-violet-500",
    accentLight: "bg-indigo-500/10",
    widgets: [
      { title: "Client Work", description: "Active matters and engagements", icon: Briefcase, color: "from-indigo-500 to-blue-500", size: "large" },
      { title: "Knowledge Base", description: "Policies, precedents and guides", icon: Scale, color: "from-violet-500 to-purple-500", size: "large" },
      { title: "Time & Billing", description: "Timesheets and invoicing", icon: Receipt, color: "from-green-500 to-emerald-500", size: "small" },
      { title: "Team Calendar", description: "Availability and scheduling", icon: Calendar, color: "from-cyan-500 to-blue-500", size: "small" },
      { title: "Compliance", description: "SRA, ICAEW and regulators", icon: CheckCircle, color: "from-teal-500 to-cyan-500", size: "small" },
      { title: "Client Comms", description: "Email templates and updates", icon: MessageSquare, color: "from-pink-500 to-rose-500", size: "small" },
    ],
  },
  Trades: {
    greeting: "Your trade intelligence is live",
    accent: "from-yellow-500 to-orange-500",
    accentLight: "bg-yellow-500/10",
    widgets: [
      { title: "Job Board", description: "Current and upcoming jobs", icon: Wrench, color: "from-orange-500 to-red-500", size: "large" },
      { title: "Health & Safety", description: "Risk assessments and method statements", icon: Shield, color: "from-red-500 to-pink-500", size: "large" },
      { title: "Quotes", description: "Generate and track quotes", icon: Calculator, color: "from-green-500 to-emerald-500", size: "small" },
      { title: "Certifications", description: "Track qualifications and expiry", icon: CheckCircle, color: "from-blue-500 to-cyan-500", size: "small" },
      { title: "Suppliers", description: "Materials and pricing", icon: Package, color: "from-violet-500 to-purple-500", size: "small" },
      { title: "Invoicing", description: "Create and chase invoices", icon: Receipt, color: "from-amber-500 to-yellow-500", size: "small" },
    ],
  },
  Property: {
    greeting: "Your property management AI is ready",
    accent: "from-teal-500 to-emerald-500",
    accentLight: "bg-teal-500/10",
    widgets: [
      { title: "Portfolio", description: "Properties and tenancies", icon: Building2, color: "from-teal-500 to-cyan-500", size: "large" },
      { title: "Compliance", description: "EPC, gas safety and licensing", icon: Shield, color: "from-red-500 to-orange-500", size: "large" },
      { title: "Maintenance", description: "Repairs and contractor jobs", icon: Wrench, color: "from-amber-500 to-yellow-500", size: "small" },
      { title: "Financials", description: "Rent, arrears and accounts", icon: Calculator, color: "from-green-500 to-emerald-500", size: "small" },
      { title: "Tenancy Docs", description: "ASTs, inventories and notices", icon: FileText, color: "from-blue-500 to-indigo-500", size: "small" },
      { title: "Viewings", description: "Schedule and track viewings", icon: Calendar, color: "from-violet-500 to-purple-500", size: "small" },
    ],
  },
  Automotive: {
    greeting: "Your automotive AI is running",
    accent: "from-red-500 to-rose-500",
    accentLight: "bg-red-500/10",
    widgets: [
      { title: "Workshop", description: "Active jobs and bay status", icon: Wrench, color: "from-red-500 to-orange-500", size: "large" },
      { title: "Fleet", description: "Vehicle tracking and servicing", icon: Car, color: "from-blue-500 to-cyan-500", size: "large" },
      { title: "Parts", description: "Inventory and ordering", icon: Package, color: "from-green-500 to-emerald-500", size: "small" },
      { title: "Customers", description: "CRM and service history", icon: Users, color: "from-violet-500 to-purple-500", size: "small" },
      { title: "Sales", description: "Pipeline and valuations", icon: TrendingUp, color: "from-amber-500 to-yellow-500", size: "small" },
      { title: "Compliance", description: "MOT, insurance, DVLA", icon: Shield, color: "from-teal-500 to-cyan-500", size: "small" },
    ],
  },
  Retail: {
    greeting: "Your retail intelligence is live",
    accent: "from-pink-500 to-rose-500",
    accentLight: "bg-pink-500/10",
    widgets: [
      { title: "Sales Overview", description: "Revenue, trends and targets", icon: TrendingUp, color: "from-pink-500 to-rose-500", size: "large" },
      { title: "Inventory", description: "Stock levels and reordering", icon: Package, color: "from-blue-500 to-cyan-500", size: "large" },
      { title: "Customers", description: "Loyalty and insights", icon: Users, color: "from-violet-500 to-purple-500", size: "small" },
      { title: "Marketing", description: "Campaigns and promotions", icon: Target, color: "from-orange-500 to-red-500", size: "small" },
      { title: "Staff", description: "Rota and performance", icon: Calendar, color: "from-green-500 to-emerald-500", size: "small" },
      { title: "Suppliers", description: "Orders and lead times", icon: Truck, color: "from-amber-500 to-yellow-500", size: "small" },
    ],
  },
  Logistics: {
    greeting: "Your logistics command centre is active",
    accent: "from-cyan-500 to-blue-500",
    accentLight: "bg-cyan-500/10",
    widgets: [
      { title: "Fleet Status", description: "Live tracking and routes", icon: Truck, color: "from-cyan-500 to-blue-500", size: "large" },
      { title: "Deliveries", description: "Scheduled and in-transit", icon: Package, color: "from-green-500 to-emerald-500", size: "large" },
      { title: "Driver Hub", description: "Hours, CPC and compliance", icon: Users, color: "from-violet-500 to-purple-500", size: "small" },
      { title: "Warehouse", description: "Stock and pick operations", icon: ClipboardList, color: "from-amber-500 to-orange-500", size: "small" },
      { title: "Maintenance", description: "Vehicle servicing schedule", icon: Wrench, color: "from-red-500 to-pink-500", size: "small" },
      { title: "Costs", description: "Fuel, tolls and efficiency", icon: Calculator, color: "from-teal-500 to-cyan-500", size: "small" },
    ],
  },
  Hospitality: {
    greeting: "Your hospitality AI is ready to serve",
    accent: "from-amber-500 to-orange-500",
    accentLight: "bg-amber-500/10",
    widgets: [
      { title: "Reservations", description: "Bookings and covers", icon: Calendar, color: "from-amber-500 to-orange-500", size: "large" },
      { title: "Staff Rota", description: "Shifts, absences and compliance", icon: Users, color: "from-violet-500 to-purple-500", size: "large" },
      { title: "Food Safety", description: "HACCP, allergens and audits", icon: Shield, color: "from-red-500 to-pink-500", size: "small" },
      { title: "Suppliers", description: "Orders and deliveries", icon: Truck, color: "from-green-500 to-emerald-500", size: "small" },
      { title: "Reviews", description: "Customer feedback and responses", icon: MessageSquare, color: "from-blue-500 to-cyan-500", size: "small" },
      { title: "Revenue", description: "Sales and GP analysis", icon: TrendingUp, color: "from-teal-500 to-cyan-500", size: "small" },
    ],
  },
  Manufacturing: {
    greeting: "Your production AI is operational",
    accent: "from-emerald-500 to-green-500",
    accentLight: "bg-emerald-500/10",
    widgets: [
      { title: "Production", description: "Lines, output and efficiency", icon: Settings, color: "from-emerald-500 to-green-500", size: "large" },
      { title: "Quality", description: "Inspections, NCRs and CAPA", icon: CheckCircle, color: "from-blue-500 to-cyan-500", size: "large" },
      { title: "Safety", description: "Risk assessments and incidents", icon: AlertTriangle, color: "from-red-500 to-orange-500", size: "small" },
      { title: "Inventory", description: "Raw materials and WIP", icon: Package, color: "from-violet-500 to-purple-500", size: "small" },
      { title: "Maintenance", description: "Planned and reactive", icon: Wrench, color: "from-amber-500 to-yellow-500", size: "small" },
      { title: "Compliance", description: "ISO, BSI and audits", icon: Shield, color: "from-teal-500 to-cyan-500", size: "small" },
    ],
  },
  "General SME": {
    greeting: "Your business AI is ready",
    accent: "from-blue-500 to-indigo-500",
    accentLight: "bg-blue-500/10",
    widgets: [
      { title: "Overview", description: "KPIs and business health", icon: BarChart3, color: "from-blue-500 to-indigo-500", size: "large" },
      { title: "Documents", description: "Policies, contracts and SOPs", icon: FileText, color: "from-violet-500 to-purple-500", size: "large" },
      { title: "HR", description: "Staff, absence and compliance", icon: Users, color: "from-cyan-500 to-blue-500", size: "small" },
      { title: "Finance", description: "Invoicing and bookkeeping", icon: Calculator, color: "from-green-500 to-emerald-500", size: "small" },
      { title: "Compliance", description: "GDPR, H&S and more", icon: Shield, color: "from-red-500 to-pink-500", size: "small" },
      { title: "Ask Atlas", description: "Your AI assistant", icon: MessageSquare, color: "from-amber-500 to-orange-500", size: "small" },
    ],
  },
};
