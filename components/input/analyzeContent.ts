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

export const KEY_TAKEAWAYS: Record<DocumentType, string[]> = {
  EMPLOYMENT_CONTRACT: [
    "Spot restrictive non-compete clauses that may limit your future career options",
    "Review IP assignment provisions so you keep what you build on your own time",
    "Understand your compensation structure, bonus terms, and severance protections",
    "Get plain-English findings with specific points to raise before you sign",
  ],
  NDA: [
    "Know exactly what information you are obligated to keep confidential",
    "See how long those obligations survive after the agreement ends",
    "Catch missing carve-outs for public or independently developed information",
    "Spot one-sided terms in an agreement that should be mutual",
  ],
  RESIDENTIAL_LEASE: [
    "Understand your deposit terms and the conditions for getting it back",
    "Review rent increase, renewal, and early-termination rules before committing",
    "Clarify who is responsible for maintenance and repairs",
    "Know the notice periods for landlord entry and for moving out",
  ],
};

export const COMMON_RISKS: Record<DocumentType, string[]> = {
  EMPLOYMENT_CONTRACT: [
    "Overly broad non-compete restrictions",
    "IP assignment that reaches personal inventions",
    "Missing severance protections",
    "Vague bonus or commission calculation methods",
    "At-will termination without a notice period",
  ],
  NDA: [
    "Indefinite or excessively long confidentiality terms",
    "Overly broad definition of confidential information",
    "No carve-outs for public or independently developed information",
    "One-sided obligations in a supposedly mutual NDA",
  ],
  RESIDENTIAL_LEASE: [
    "Unclear conditions for returning the security deposit",
    "Automatic renewal paired with steep rent increases",
    "Ambiguous maintenance and repair responsibilities",
    "Harsh early-termination penalties",
    "Insufficient notice before landlord entry",
  ],
};

export const DOCUMENT_CHECKS: Record<DocumentType, string[]> = {
  EMPLOYMENT_CONTRACT: [
    "Non-compete scope and duration",
    "IP assignment and ownership clauses",
    "Severance and termination terms",
    "At-will employment provisions",
    "Bonus, equity, and compensation conditions",
    "Restrictive covenants post-employment",
  ],
  NDA: [
    "Confidentiality scope and carve-outs",
    "Survival term after agreement ends",
    "Permitted disclosures (legal, affiliates)",
    "Return or destruction of information",
    "Remedies for breach",
  ],
  RESIDENTIAL_LEASE: [
    "Security deposit amount and return conditions",
    "Renewal and rent increase terms",
    "Maintenance and repair responsibilities",
    "Early termination penalties",
    "Pet, subletting, and alteration restrictions",
    "Notice periods for entry and vacating",
  ],
};
