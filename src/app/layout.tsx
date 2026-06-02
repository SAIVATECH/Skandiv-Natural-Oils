import type { Metadata } from "next";
import { Outfit, Cinzel } from "next/font/google";
import "./globals.css";

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
  title: "SKANDÍV - Premium Organic Cold-Pressed Oils",
  description: "Experience the authentic purity of traditional wood-pressed organic oils. Sealed fresh, unrefined, and delivered via our automated WhatsApp shopping assistant.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${outfit.variable} ${cinzel.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
