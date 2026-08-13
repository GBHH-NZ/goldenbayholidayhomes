import type { Metadata } from "next";
import { Quicksand, Outfit } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Header";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { JsonLd } from "@/components/JsonLd";
import { defaultMetadata, organizationJsonLd } from "@/lib/seo";

const display = Quicksand({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NZ" className={`${display.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <GoogleAnalytics />
        <JsonLd data={organizationJsonLd()} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
