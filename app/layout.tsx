import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Stander - Electronics & Gadgets",
    template: "%s | Stander",
  },
  description: "Explore premium electronics, gadgets, laptops, smartphones, and tech accessories at Stander.",
  openGraph: {
    title: "Stander - Electronics & Gadgets",
    description: "Explore premium electronics, gadgets, laptops, smartphones, and tech accessories at Stander.",
    siteName: "Stander",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stander - Electronics & Gadgets",
    description: "Explore premium electronics, gadgets, laptops, smartphones, and tech accessories at Stander.",
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
