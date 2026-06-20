export const TRUST_ITEMS = [
  "Free & unlimited analyses",
  "No account required",
  "Document never stored",
  "Never used for AI training",
  "Results in minutes",
] as const;

export const SECURITY_ITEMS = [
  {
    icon: "lock",
    title: "End-to-end encryption",
    body: "All data in transit is protected with SSL/TLS. Your document never travels over an unencrypted connection.",
  },
  {
    icon: "shield-off",
    title: "Never used for AI training",
    body: "Your contract is not used to train, fine-tune, or improve any AI model. What you upload stays out of the pipeline.",
  },
  {
    icon: "eye-off",
    title: "PII redacted before processing",
    body: "Personally identifiable information is stripped from extracted text before it reaches the analysis layer.",
  },
  {
    icon: "database",
    title: "Document not stored",
    body: "LexLight sends extracted text for analysis only. The original document is not saved to any database.",
  },
  {
    icon: "user-x",
    title: "No account required",
    body: "Use the full analysis without creating a profile, handing over an email address, or accepting a tracking cookie wall.",
  },
  {
    icon: "timer",
    title: "Temporary auto-expiring shares",
    body: "Share links store the analysis result only when you choose to create one, and they expire automatically.",
  },
] as const;

export const WHY_AI_ROWS = [
  {
    feature: "Time to first insight",
    lexlight: "Minutes",
    traditional: "Hours to days",
  },
  {
    feature: "Cost",
    lexlight: "Free",
    traditional: "$200 – $500+",
  },
  {
    feature: "Availability",
    lexlight: "24/7, immediate",
    traditional: "By appointment",
  },
  {
    feature: "Structured risk flags",
    lexlight: "Yes — categorised by severity",
    traditional: "Varies by attorney",
  },
  {
    feature: "Missing-clause detection",
    lexlight: "Yes",
    traditional: "Varies",
  },
  {
    feature: "Full data control",
    lexlight: "Yes — document never stored",
    traditional: "Shared with law firm",
  },
  {
    feature: "Unlimited follow-up",
    lexlight: "Yes — same session",
    traditional: "Billed per hour",
  },
] as const;

export const ADVANCED_FEATURES = [
  {
    icon: "zap",
    title: "Results in minutes",
    body: "Short documents finish quickly; longer agreements typically complete within five minutes.",
  },
  {
    icon: "map-pin",
    title: "References to clauses",
    body: "Every risk flag links back to the exact clause it comes from, so you can read it in context.",
  },
  {
    icon: "layers",
    title: "Multi-document scope awareness",
    body: "LexLight reads how provisions interact — risk often hides in clause combinations, not single sentences.",
  },
  {
    icon: "infinity",
    title: "Unlimited analyses",
    body: "Run as many reviews as you need with no usage cap, no subscription, and no credit card.",
  },
  {
    icon: "message-circle",
    title: "Unlimited follow-up",
    body: "Ask targeted questions about any part of the report without re-uploading the document.",
  },
  {
    icon: "file-text",
    title: "Structured report",
    body: "Output is organised into risk levels, missing clauses, dates, obligations, and suggested language.",
  },
  {
    icon: "share-2",
    title: "Shareable results",
    body: "Create a temporary share link to discuss specific findings with a colleague or attorney.",
  },
  {
    icon: "scale",
    title: "Narrow, deep coverage",
    body: "Three document types — employment contracts, NDAs, residential leases — reviewed with tailored risk criteria.",
  },
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
    body: "LexLight checks whether the document matches a supported category and reads governing-law signals when the agreement includes them.",
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
    q: "Is LexLight really free?",
    a: "Yes. LexLight currently supports unlimited analyses and unlimited follow-up questions without an account or credit card.",
  },
  {
    q: "How long does analysis take?",
    a: "It depends on the size and complexity of the PDF. Short documents may finish quickly; longer agreements can take several minutes.",
  },
  {
    q: "Is this legal advice?",
    a: "No. LexLight provides educational information to help you understand a contract before you decide what to do next. It does not create an attorney-client relationship or replace advice from a licensed lawyer.",
  },
  {
    q: "Which documents are supported?",
    a: "Employment contracts, NDAs, and residential leases are supported today. More document types will be added soon, but the app stays intentionally narrow so each review can match the document category.",
  },
  {
    q: "What happens to my document?",
    a: "Your document is sent for AI analysis and is not stored by LexLight. If you create a share link, only the analysis result is stored temporarily so the link can work.",
  },
  {
    q: "Can I paste contract text instead?",
    a: "No. The current workflow is PDF upload only, which keeps the experience closer to how people actually receive signed agreements and avoids maintaining two different input paths.",
  },
] as const;
