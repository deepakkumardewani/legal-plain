import type { LegalSection } from "@/components/legal/LegalPage";

export const LEGAL_LAST_UPDATED = "June 20, 2026";

export const PRIVACY_INTRO =
  "This Privacy Policy explains what information LexLight handles when you analyze a document, and the choices we make to keep that information minimal. LexLight is designed so you can review a contract without creating an account or handing over personal details.";

export const PRIVACY_SECTIONS: readonly LegalSection[] = [
  {
    heading: "No account, minimal data",
    paragraphs: [
      "LexLight does not require you to sign up, provide an email address, or accept a tracking cookie wall. We do not build advertising profiles, and we do not sell or rent any data.",
    ],
  },
  {
    heading: "How your document is handled",
    paragraphs: [
      "When you upload a PDF, we extract its text and send that text to an AI model for analysis. The original file is not saved to any database after the analysis completes.",
      "Personally identifiable information (PII) is redacted from the extracted text before it reaches the analysis layer, so the model receives the contract terms rather than personal identifiers.",
    ],
  },
  {
    heading: "AI training",
    paragraphs: [
      "Your document is never used to train, fine-tune, or improve any AI model. What you upload stays out of the training pipeline.",
    ],
  },
  {
    heading: "Encryption",
    paragraphs: [
      "All data in transit is protected with SSL/TLS. Your document never travels over an unencrypted connection.",
    ],
  },
  {
    heading: "Shared analyses",
    paragraphs: [
      "If you choose to create a share link, only the analysis result — not the original document — is stored temporarily so the link can work. Shared results expire automatically.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      'LexLight is in active development, and this policy may change as the service evolves. Material updates will be reflected here with a new "last updated" date.',
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "If you have questions about this Privacy Policy or how your data is handled, please reach out through the contact options listed on our website.",
    ],
  },
];

export const TERMS_INTRO =
  "These Terms of Service govern your use of LexLight. By using the service, you agree to these terms. LexLight is a free tool that provides plain-English information about legal documents — it is not a substitute for professional legal advice.";

export const TERMS_SECTIONS: readonly LegalSection[] = [
  {
    heading: "Not legal advice",
    paragraphs: [
      "LexLight provides general educational information only. It does not create an attorney-client relationship and does not replace advice from a licensed lawyer.",
      "The analysis may contain errors and does not account for all applicable laws. Do not rely on the analysis alone to make legal decisions. For matters of significant consequence, consult a licensed attorney in your jurisdiction.",
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: [
      "You agree to upload only documents you have the right to review, and to use LexLight for lawful purposes. Do not attempt to disrupt, reverse engineer, or abuse the service or its underlying infrastructure.",
    ],
  },
  {
    heading: "Supported documents",
    paragraphs: [
      "LexLight currently supports employment contracts, NDAs, and residential leases, provided as PDF uploads. Supported document types and features may change over time.",
    ],
  },
  {
    heading: "Beta service",
    paragraphs: [
      "LexLight is offered in beta. Features, availability, and analysis quality may change, and the service may occasionally be interrupted while we make improvements.",
    ],
  },
  {
    heading: "No warranty",
    paragraphs: [
      'The service is provided "as is" and "as available," without warranties of any kind, express or implied. We do not warrant that the analysis will be accurate, complete, or suitable for any particular purpose.',
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, LexLight and its operators are not liable for any indirect, incidental, or consequential damages arising from your use of, or reliance on, the service or its output.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: [
      "We may update these terms as the service evolves. Continued use after an update constitutes acceptance of the revised terms.",
    ],
  },
];
