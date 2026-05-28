export const TRUST_ITEMS = [
  "No account or email",
  "PDF upload only",
  "Document not stored",
  "Typically under 5 minutes",
  "Unlimited analyses",
] as const;

export const DOCUMENT_SCOPES = [
  {
    name: "Employment contracts",
    description: "Offer letters and employment agreements reviewed from the employee's side.",
    focus: [
      "Restrictive covenants",
      "IP assignment and invention carve-outs",
      "Termination, severance, and notice terms",
      "Arbitration and class-action waivers",
    ],
  },
  {
    name: "NDAs",
    description:
      "Confidentiality agreements reviewed for receiving, disclosing, or mutual parties.",
    focus: [
      "Confidential-information scope",
      "Permitted disclosures and exclusions",
      "Survival periods and trade-secret carve-outs",
      "Injunctive relief, residuals, and one-sided terms",
    ],
  },
  {
    name: "Residential leases",
    description: "Apartment and rental agreements reviewed from the tenant's perspective.",
    focus: [
      "Security deposits and fee language",
      "Entry, maintenance, and habitability terms",
      "Renewal, termination, and notice deadlines",
      "Tenant duties, guest rules, and subletting limits",
    ],
  },
] as const;

export const METHOD_STEPS = [
  {
    num: "01",
    title: "Upload your document",
    body: "Start with the PDF you were actually asked to sign. No paste box, no account gate, no intake form before the review.",
  },
  {
    num: "02",
    title: "Identify the contract type",
    body: "LegalPlain checks whether the document matches a supported category and reads governing-law signals when the agreement includes them.",
  },
  {
    num: "03",
    title: "Review clauses in context",
    body: "Clauses are evaluated together, because risk often appears in how provisions interact rather than in one isolated sentence.",
  },
  {
    num: "04",
    title: "Get a structured report",
    body: "The result separates risks, missing terms, dates, obligations, and practical language you may want to ask for.",
  },
] as const;

export const REPORT_ITEMS = [
  {
    title: "Risk levels",
    body: "Clauses are separated into red flags, unusual terms, context-dependent language, and standard provisions.",
  },
  {
    title: "Missing clauses",
    body: "The report calls out important protections that may be absent, such as carve-outs, return obligations, or termination rights.",
  },
  {
    title: "Dates and deadlines",
    body: "Notice periods, renewal windows, probation periods, and other time-sensitive obligations are surfaced clearly.",
  },
  {
    title: "Rights and obligations",
    body: "The output separates what you must do from what the contract gives you, so the practical impact is easier to see.",
  },
  {
    title: "Unlimited follow-up",
    body: "Ask targeted questions about the report without re-uploading the same document during the same analysis session.",
  },
  {
    title: "Export and share",
    body: "Save the analysis or create a temporary share link for focused review. Shared analysis results expire automatically.",
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "Is LegalPlain really free?",
    a: "Yes. LegalPlain currently supports unlimited analyses and unlimited follow-up questions without an account or credit card.",
  },
  {
    q: "How long does analysis take?",
    a: "It depends on the size and complexity of the PDF. Short documents may finish quickly; longer agreements can take several minutes.",
  },
  {
    q: "Is this legal advice?",
    a: "No. LegalPlain provides educational information to help you understand a contract before you decide what to do next. It does not create an attorney-client relationship or replace advice from a licensed lawyer.",
  },
  {
    q: "Which documents are supported?",
    a: "Employment contracts, NDAs, and residential leases are supported today. More document types will be added soon, but the app stays intentionally narrow so each review can match the document category.",
  },
  {
    q: "What happens to my document?",
    a: "Your document is sent for AI analysis and is not stored by LegalPlain. If you create a share link, only the analysis result is stored temporarily so the link can work.",
  },
  {
    q: "Can I paste contract text instead?",
    a: "No. The current workflow is PDF upload only, which keeps the experience closer to how people actually receive signed agreements and avoids maintaining two different input paths.",
  },
] as const;
