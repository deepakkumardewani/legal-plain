import type { DocumentType } from "@/lib/types";

export const DOCUMENT_TYPES: {
  value: DocumentType;
  label: string;
  hint: string;
}[] = [
  {
    value: "EMPLOYMENT_CONTRACT",
    label: "Employment contract",
    hint: "Offer letters, employment agreements, restrictive covenants",
  },
  {
    value: "NDA",
    label: "NDA",
    hint: "Confidentiality, disclosure limits, survival terms",
  },
  {
    value: "RESIDENTIAL_LEASE",
    label: "Residential lease",
    hint: "Rent, deposits, renewal, maintenance, tenant duties",
  },
];

export const NDA_ROLES = [
  {
    value: "RECEIVING",
    label: "Receiving party",
    hint: "You are being asked to protect someone else's confidential information.",
  },
  {
    value: "DISCLOSING",
    label: "Disclosing party",
    hint: "You are sharing information and want to understand how it is protected.",
  },
  {
    value: "MUTUAL",
    label: "Mutual NDA",
    hint: "Both sides are sharing confidential information.",
  },
] as const;
