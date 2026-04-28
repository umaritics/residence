export type Priority = "high" | "medium" | "low";
export type LeadStatus = "new" | "contacted" | "negotiating" | "closed" | "lost";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  budget: number; // in PKR
  priority: Priority;
  status: LeadStatus;
  followUp: string;
  agent: string;
}

export const MOCK_LEADS: Lead[] = [
  {
    id: "L-1042",
    name: "Hamza Iqbal",
    email: "hamza.iqbal@gmail.com",
    phone: "+92 321 4587 209",
    property: "DHA Phase 8 — 1 Kanal Plot",
    budget: 48_500_000,
    priority: "high",
    status: "negotiating",
    followUp: "May 02, 2026",
    agent: "Ali Raza",
  },
  {
    id: "L-1041",
    name: "Ayesha Khan",
    email: "ayesha.k@outlook.com",
    phone: "+92 300 8842 110",
    property: "Bahria Town Karachi — Villa",
    budget: 32_000_000,
    priority: "high",
    status: "contacted",
    followUp: "Apr 30, 2026",
    agent: "Sara Malik",
  },
  {
    id: "L-1040",
    name: "Bilal Ahmed",
    email: "bilal.ahmed@company.pk",
    phone: "+92 333 2210 947",
    property: "Gulberg Greens — 10 Marla",
    budget: 18_500_000,
    priority: "medium",
    status: "new",
    followUp: "May 04, 2026",
    agent: "Ali Raza",
  },
  {
    id: "L-1039",
    name: "Fatima Sheikh",
    email: "fatima.sheikh@gmail.com",
    phone: "+92 345 7781 022",
    property: "Emaar Crescent Bay — Apartment",
    budget: 26_750_000,
    priority: "medium",
    status: "negotiating",
    followUp: "Apr 29, 2026",
    agent: "Usman Tariq",
  },
  {
    id: "L-1038",
    name: "Zain Abbasi",
    email: "zain.abbasi@gmail.com",
    phone: "+92 312 5540 881",
    property: "Bahria Enclave Islamabad — 1 Kanal",
    budget: 9_800_000,
    priority: "low",
    status: "lost",
    followUp: "Apr 22, 2026",
    agent: "Sara Malik",
  },
  {
    id: "L-1037",
    name: "Mariam Yousaf",
    email: "mariam.y@gmail.com",
    phone: "+92 322 9907 154",
    property: "DHA Lahore Phase 6 — 5 Marla",
    budget: 14_200_000,
    priority: "medium",
    status: "closed",
    followUp: "Apr 18, 2026",
    agent: "Usman Tariq",
  },
];

export function formatPKR(n: number) {
  if (n >= 10_000_000) return `PKR ${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)} M`;
  return `PKR ${n.toLocaleString()}`;
}
