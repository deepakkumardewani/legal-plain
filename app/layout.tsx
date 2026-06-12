import type { Metadata, Viewport } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_THEME_COLOR, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Plain-English legal document analysis`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "legal document analysis",
    "plain English contracts",
    "contract review",
    "lease analysis",
    "terms of service",
    "AI legal assistant",
  ],
  alternates: { canonical: "/" },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Plain-English legal document analysis`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Plain-English legal document analysis`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: SITE_THEME_COLOR,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
