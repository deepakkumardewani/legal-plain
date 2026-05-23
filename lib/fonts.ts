import { Bricolage_Grotesque, Barlow } from "next/font/google";

export const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

export const bodyFont = Barlow({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const fontVariables = `${displayFont.variable} ${bodyFont.variable}`;
