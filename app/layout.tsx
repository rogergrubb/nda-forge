import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free NDA Generator — AI-Powered Non-Disclosure Agreement | NDAForge",
  description:
    "Generate a professional, custom NDA in 30 seconds. AI-powered, free preview, $9 one-time download. Mutual and unilateral NDAs. No signup required.",
  keywords: [
    "nda generator",
    "free nda generator",
    "non disclosure agreement generator",
    "nda template free",
    "mutual nda generator",
    "nda generator online",
    "free non disclosure agreement",
    "ai nda generator",
    "nda maker",
    "simple nda template",
  ],
  metadataBase: new URL("https://getndaforge.com"),
  alternates: { canonical: "https://getndaforge.com" },
  openGraph: {
    title: "Free AI NDA Generator | NDAForge",
    description: "Custom Non-Disclosure Agreement in 30 seconds. Free preview, $9 to download.",
    type: "website",
    url: "https://getndaforge.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI NDA Generator | NDAForge",
    description: "Generate a custom NDA in 30 seconds. Free preview, $9 to download. No signup.",
  },
  verification: {
    google: "59c427b865d5e481",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
