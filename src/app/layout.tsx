import type { Metadata } from "next";
import { Outfit, Cinzel } from "next/font/google";
import "./globals.css";
import { StorefrontShell } from "@/components/storefront/storefront-shell";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SKANDÍV - Pure Mara Chekku Cold-Pressed Organic Oils",
  description: "Experience the authentic purity of traditional wood-pressed organic oils. Sealed fresh, 100% unrefined, zero chemical additives, delivered nationwide with instant WhatsApp shopping.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://skandiv-natural-oils-b6p7.vercel.app"),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "SKANDÍV - Traditional Mara Chekku Cold-Pressed Oils",
    description: "100% Raw & Organic Cold-Pressed Oils extracted via Mara Chekku. Fast shipping across India with instant WhatsApp ordering.",
    url: "https://skandiv-natural-oils-b6p7.vercel.app",
    siteName: "Skandiv Natural Oils",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 800,
        alt: "Skandiv Natural Oils",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SKANDÍV - Pure Mara Chekku Cold-Pressed Oils",
    description: "Authentic single-origin cold-pressed organic oils. 0% Chemicals & Additives.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919342365917';

  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${outfit.variable} ${cinzel.variable} font-sans antialiased bg-slate-950 text-slate-100 min-h-screen`}
      >
        <StorefrontShell whatsappPhone={whatsappPhone}>
          {children}
        </StorefrontShell>
      </body>
    </html>
  );
}
