import type { Metadata } from "next";
import { Crimson_Text, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Serif font voor long-form content (manifesto)
const crimsonText = Crimson_Text({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: true,
});

// Sans-serif font voor UI, nav, metadata
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// Mono font voor tech details, numbers
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Mini-ECD | PinkRoccade GGZ",
  description: "Mini-ECD prototype voor AI-inspiratiesessie - Intake, Probleemprofiel en Behandelplan met AI-ondersteuning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body
        className={`${crimsonText.variable} ${inter.variable} ${jetBrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
