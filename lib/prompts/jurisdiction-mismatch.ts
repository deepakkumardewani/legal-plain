import type { DocumentType } from "@/lib/types";

const MISMATCH_SNIPPETS: Record<
  DocumentType,
  (governingLaw: string, partyLocation: string) => string
> = {
  EMPLOYMENT_CONTRACT: (governingLaw, partyLocation) =>
    `JURISDICTION WARNING: This employment contract is governed by ${governingLaw} law, but at least one party appears to be based in ${partyLocation}. Employment laws vary significantly between jurisdictions — key differences include: non-compete enforceability, at-will employment defaults, wage and hour requirements, overtime eligibility, mandatory benefits (sick leave, family leave), and restrictive covenant standards. Analyze each clause against ${governingLaw} standards but flag clauses where ${partyLocation} law would provide stronger employee protections. For each affected clause, explain what would be different under ${partyLocation} law and what the employee should ask for.`,

  NDA: (governingLaw, partyLocation) =>
    `JURISDICTION WARNING: This NDA is governed by ${governingLaw} law, but at least one party appears to be based in ${partyLocation}. NDA and trade secret laws differ across jurisdictions — key differences include: definition of confidential information, duration of obligations, trade secret protections under state-specific UTSA variations, inevitable disclosure doctrine applicability, and non-solicitation overlap. Analyze each clause against ${governingLaw} standards but flag clauses where ${partyLocation} law would provide different protections.`,

  RESIDENTIAL_LEASE: (governingLaw, partyLocation) =>
    `JURISDICTION WARNING: This lease is governed by ${governingLaw} law, but at least one party (likely the tenant) appears to be based in ${partyLocation}. Landlord-tenant laws vary dramatically between jurisdictions — key differences include: security deposit limits and return timelines, habitability standards, eviction procedures and notice periods, rent control applicability, late fee maximums, and tenant remedies. Analyze each clause against ${governingLaw} standards but flag clauses where ${partyLocation} law would provide stronger tenant protections. For each affected clause, explain what would be different under ${partyLocation} law.`,
};

export function getMismatchSnippet(
  documentType: DocumentType,
  governingLaw: string,
  partyLocation: string,
): string {
  return MISMATCH_SNIPPETS[documentType](governingLaw, partyLocation);
}
