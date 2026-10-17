import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SITE_URL } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Stander Trader - Electronics & Gadgets",
    template: "%s | Stander Trader",
  },
  description: "Explore premium electronics, gadgets, laptops, smartphones, and tech accessories at Stander Trader.",
  openGraph: {
    type: "website",
    siteName: "Stander Trader",
    locale: "en_PK",
    title: "Stander Trader - Electronics & Gadgets",
    description: "Explore premium electronics, gadgets, laptops, smartphones, and tech accessories at Stander Trader.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stander Trader - Electronics & Gadgets",
    description: "Explore premium electronics, gadgets, laptops, smartphones, and tech accessories at Stander Trader.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
