const FALLBACK_URL = "https://legal-plain.vercel.app";

/**
 * Canonical production URL. Set NEXT_PUBLIC_SITE_URL in the environment
 * (Vercel exposes the deployment domain) to override the fallback.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_URL).replace(/\/$/, "");

export const SITE_NAME = "LegalPlain";

export const SITE_DESCRIPTION =
  "Free, plain-English legal document analysis. Understand contracts, leases, and terms of service in seconds — your documents are analyzed without being stored.";

export const SITE_THEME_COLOR = "#0e0f16";
