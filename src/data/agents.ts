// Single source of truth for the 10 Atlas agents.
// IDs are stable — they map to portrait assets and to the existing
// agent-prompts.ts persona system. Order here is also the default
// office grid placement order.
import financePortrait from "@/assets/office/agents/finance/portrait.png";
import marketingPortrait from "@/assets/office/agents/marketing/portrait.png";
import salesPortrait from "@/assets/office/agents/sales/portrait.png";
import peoplePortrait from "@/assets/office/agents/people/portrait.png";
import opsPortrait from "@/assets/office/agents/ops/portrait.png";
import compliancePortrait from "@/assets/office/agents/compliance/portrait.png";
import itPortrait from "@/assets/office/agents/it/portrait.png";
import knowledgePortrait from "@/assets/office/agents/knowledge/portrait.png";
import csPortrait from "@/assets/office/agents/cs/portrait.png";
import procurementPortrait from "@/assets/office/agents/procurement/portrait.png";

export type AgentId =
  | "finance"
  | "marketing"
  | "sales"
  | "people"
  | "ops"
  | "compliance"
  | "it"
  | "knowledge"
  | "cs"
  | "procurement";

export interface Agent {
  id: AgentId;
  /** Default display name (user can rename per-instance). */
  defaultName: string;
  /** Short eyebrow role label (mono uppercase). */
  role: string;
  /** First-person pitch on the Hire card. */
  pitch: string;
  /** Three short stat strings shown under the pitch. */
  stats: [string, string, string];
  /** Specialism pill badges. */
  tags: string[];
  /** Agent voice & personality cues used in pop-in copy. */
  voice: string;
  /** Portrait asset (head & shoulders). */
  portrait: string;
  /** Recommended grid position (column, row) when first hired. 0-indexed. */
  defaultGrid: { x: number; y: number };
  /** Themed accent for desk + status glow (HSL string fragment). */
  accent: string;
  /** Contexts where this agent will pop in proactively. */
  contexts: string[];
  /** Sample contextual prompt per known context, used by the pop-in system. */
  popins: Record<string, string>;
  /** Map back to the existing agent-prompts.ts module IDs (so existing
   * personas keep working when this agent is hired). */
  legacyModuleIds: string[];
}

export const AGENTS: Agent[] = [
  {
    id: "finance",
    defaultName: "Finance",
    role: "FINANCE OPS",
    pitch:
      "I turn messy spreadsheets into clean reports. I'll flag the anomaly before your CFO does — and tell you what to do about it.",
    stats: [
      "Handles 200+ docs/mo",
      "Speaks: SQL, Excel, plain English",
      "Integrates: Xero, QuickBooks, Stripe",
    ],
    tags: ["Reporting", "Cash flow", "Anomalies", "Reconciliation"],
    voice: "Precise, dry, slightly sceptical. Lead with the number, then the so-what.",
    portrait: financePortrait,
    defaultGrid: { x: 0, y: 0 },
    accent: "221 83% 53%",
    contexts: ["finance", "documents", "dashboard"],
    popins: {
      finance:
        "Hey — I noticed the Q3 numbers. Marketing spend is sitting ~18% above plan. Want me to pull the line-by-line?",
      documents:
        "I can see this is a financial doc. I'll have a one-page summary ready in 30 seconds if you want it.",
      dashboard:
        "Three invoices crossed 30 days overdue this week. Want me to draft the follow-ups?",
    },
    legacyModuleIds: ["finance"],
  },
  {
    id: "people",
    defaultName: "People",
    role: "HR & PEOPLE",
    pitch:
      "I make sure no one falls through the cracks. Onboarding, leave, contracts — quietly handled before you have to ask.",
    stats: [
      "Tracks the entire team lifecycle",
      "Speaks: empathy, policy, plain English",
      "Integrates: HiBob, BambooHR, Slack",
    ],
    tags: ["Onboarding", "Leave", "Policy", "Reviews"],
    voice: "Warm, measured, people-first. Always considers tone.",
    portrait: peoplePortrait,
    defaultGrid: { x: 1, y: 0 },
    accent: "152 60% 45%",
    contexts: ["hr", "people", "documents"],
    popins: {
      hr: "Before we send this, a quick thought on tone — the current draft might land harsher than intended. Want me to soften it?",
      people:
        "Sam's six-month probation ends on the 14th. I've drafted a review template you can edit in two minutes.",
    },
    legacyModuleIds: ["hr-policies", "employment-law"],
  },
  {
    id: "sales",
    defaultName: "Sales",
    role: "REVENUE OPS",
    pitch:
      "I keep your pipeline honest. Stale deals, missed follow-ups, weak forecasts — I see them before they cost you a quarter.",
    stats: [
      "Tracks every stage, every signal",
      "Speaks: CRM, email, deal psychology",
      "Integrates: HubSpot, Pipedrive, Salesforce",
    ],
    tags: ["Pipeline", "Forecasting", "Outreach"],
    voice: "Direct, energetic, results-focused. Always proposes a next move.",
    portrait: salesPortrait,
    defaultGrid: { x: 2, y: 0 },
    accent: "12 76% 55%",
    contexts: ["sales", "email", "dashboard"],
    popins: {
      sales:
        "This deal hasn't moved in 18 days — let's close it. I have an angle based on their last reply.",
      email:
        "I can see you're drafting outreach. Want me to A/B two subject lines based on what's worked for similar prospects?",
    },
    legacyModuleIds: ["sales"],
  },
  {
    id: "marketing",
    defaultName: "Marketing",
    role: "MARKETING",
    pitch:
      "I help your words travel further. Briefs, copy, campaign analysis — written like a human who reads the room.",
    stats: [
      "Drafts & edits at brand voice",
      "Speaks: ICP, hooks, distribution",
      "Integrates: Mailchimp, LinkedIn, GA4",
    ],
    tags: ["Copy", "Campaigns", "Brand voice"],
    voice: "Warm, curious, upbeat. Loves a strong hook.",
    portrait: marketingPortrait,
    defaultGrid: { x: 3, y: 0 },
    accent: "330 70% 55%",
    contexts: ["marketing", "email", "documents"],
    popins: {
      marketing:
        "Ooh, this copy has potential — but the hook is buried in line three. Want a punchier opener?",
      email:
        "Subject lines are doing 60% of the work here. I have three you might prefer.",
    },
    legacyModuleIds: [],
  },
  {
    id: "ops",
    defaultName: "Ops",
    role: "OPERATIONS",
    pitch:
      "I bring structure without bureaucracy. Status updates without meetings. Process gaps caught before they become problems.",
    stats: [
      "Tracks dependencies, not just tasks",
      "Speaks: PM, SOPs, calm logistics",
      "Integrates: Linear, Asana, Notion",
    ],
    tags: ["Projects", "SOPs", "Status"],
    voice: "Calm, systematic. Surfaces the gap, then proposes a fix.",
    portrait: opsPortrait,
    defaultGrid: { x: 0, y: 1 },
    accent: "215 25% 35%",
    contexts: ["ops", "dashboard", "documents"],
    popins: {
      ops: "I see a process gap here — three handoffs between sales and onboarding aren't documented. Want me to draft an SOP?",
    },
    legacyModuleIds: ["project-management", "sops"],
  },
  {
    id: "compliance",
    defaultName: "Compliance",
    role: "COMPLIANCE & LEGAL",
    pitch:
      "I make regulatory complexity feel manageable. Deadlines tracked, contracts reviewed, risks flagged — without legal jargon.",
    stats: [
      "Tracks GDPR, H&S, contract renewals",
      "Speaks: policy, plain English",
      "Not a lawyer — knows when to flag one",
    ],
    tags: ["GDPR", "Contracts", "Risk"],
    voice: "Considered, careful, clear. Names the risk and quantifies it.",
    portrait: compliancePortrait,
    defaultGrid: { x: 1, y: 1 },
    accent: "350 60% 45%",
    contexts: ["legal", "documents", "compliance"],
    popins: {
      legal:
        "This contract has an auto-renewal clause that triggers in 21 days. Two-paragraph summary if you want it.",
      compliance:
        "Your last GDPR audit was 11 months ago. Want me to draft the review checklist now so it's not a fire-drill?",
    },
    legacyModuleIds: ["contracts", "gdpr", "compliance", "health-safety", "risk-assessments"],
  },
  {
    id: "it",
    defaultName: "IT",
    role: "IT & SECURITY",
    pitch:
      "Quiet guardian of your stack. Licences tracked, access cleaned up, security hygiene maintained — before tickets arrive.",
    stats: [
      "Tracks every tool & seat",
      "Speaks: SaaS, security, plain English",
      "Integrates: Okta, Google, 1Password",
    ],
    tags: ["Licences", "Access", "Security"],
    voice: "Calm, competent, never patronising.",
    portrait: itPortrait,
    defaultGrid: { x: 2, y: 1 },
    accent: "265 50% 50%",
    contexts: ["it", "security", "documents"],
    popins: {
      it: "Two ex-employees still have active Slack accounts. Want me to draft the offboarding checklist?",
    },
    legacyModuleIds: ["cyber-security"],
  },
  {
    id: "knowledge",
    defaultName: "Knowledge",
    role: "KNOWLEDGE",
    pitch:
      "Your organisational memory. I turn what's in someone's head into what your team can actually find.",
    stats: [
      "Searches across every doc you upload",
      "Speaks: SOPs, FAQs, runbooks",
      "Integrates: Notion, Drive, Confluence",
    ],
    tags: ["Search", "Docs", "SOPs"],
    voice: "Patient, thorough. Finds the answer, then writes it down for next time.",
    portrait: knowledgePortrait,
    defaultGrid: { x: 3, y: 1 },
    accent: "45 90% 50%",
    contexts: ["documents", "knowledge"],
    popins: {
      documents:
        "I noticed three teammates asked the same question this week. Want me to draft an FAQ entry?",
    },
    legacyModuleIds: ["training"],
  },
  {
    id: "cs",
    defaultName: "Customer Success",
    role: "CUSTOMER SUCCESS",
    pitch:
      "I spot the customer who's gone quiet before anyone else does. Renewal risk down. Expansion up. Without nagging.",
    stats: [
      "Monitors health & sentiment signals",
      "Speaks: empathy, ROI, retention",
      "Integrates: Intercom, Zendesk, HubSpot",
    ],
    tags: ["Retention", "Health", "QBRs"],
    voice: "Attentive, proactive, commercially aware.",
    portrait: csPortrait,
    defaultGrid: { x: 0, y: 2 },
    accent: "180 65% 40%",
    contexts: ["cs", "email", "dashboard"],
    popins: {
      cs: "Three accounts have gone silent for 14+ days. I've ranked them by risk and drafted check-ins for each.",
    },
    legacyModuleIds: ["customer-service"],
  },
  {
    id: "procurement",
    defaultName: "Procurement",
    role: "PROCUREMENT",
    pitch:
      "I make sure money goes out wisely and vendors deliver what they promised. Contracts reviewed, renewals caught, spend pruned.",
    stats: [
      "Tracks every contract & renewal",
      "Speaks: vendor management, value",
      "Catches auto-renewals before they fire",
    ],
    tags: ["Vendors", "Contracts", "Spend"],
    voice: "Commercially sharp, fair, detail-oriented.",
    portrait: procurementPortrait,
    defaultGrid: { x: 1, y: 2 },
    accent: "120 40% 35%",
    contexts: ["procurement", "documents"],
    popins: {
      procurement:
        "Two SaaS subscriptions auto-renew next month at a combined £4,800/yr. Want me to pull usage stats first?",
    },
    legacyModuleIds: ["procurement", "supplier-management"],
  },
];

export const AGENTS_BY_ID: Record<AgentId, Agent> = AGENTS.reduce(
  (acc, a) => ({ ...acc, [a.id]: a }),
  {} as Record<AgentId, Agent>,
);

export function getAgent(id: string): Agent | undefined {
  return AGENTS_BY_ID[id as AgentId];
}
