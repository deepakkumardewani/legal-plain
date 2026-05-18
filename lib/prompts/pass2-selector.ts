import type { DocumentType, Pass1Result } from "@/lib/types";
import { buildPass2Prompt as buildEmployment } from "./pass2-employment";
import { buildPass2Prompt as buildNda } from "./pass2-nda";
import { buildPass2Prompt as buildLease } from "./pass2-lease";

interface Pass2Prompt {
  system: string;
  user: string;
}

interface Pass2Input {
  documentText: string;
  effectiveJurisdiction: string;
  mismatchSnippet?: string;
  pass1: Pass1Result;
}

type Pass2Builder = (input: Pass2Input) => Pass2Prompt;

export function getPass2Builder(documentType: DocumentType): Pass2Builder {
  switch (documentType) {
    case "EMPLOYMENT_CONTRACT":
      return buildEmployment as Pass2Builder;
    case "NDA":
      return buildNda as Pass2Builder;
    case "RESIDENTIAL_LEASE":
      return buildLease as Pass2Builder;
  }
}
