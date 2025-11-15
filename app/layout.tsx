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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://aispeedrun.vercel.app'),
  title: {
    default: 'AI Speedrun - Software on Demand',
    template: '%s | AI Speedrun',
  },
  description: 'Jensen Huang: "AI is going to eat software". Een experiment: bouw een EPD in 4 weken voor €200.',
  keywords: ['AI', 'Software on Demand', 'EPD', 'Development', 'Build in Public'],
  authors: [{ name: 'Colin van der Heijden', url: 'https://ikbenlit.nl' }],
  creator: 'Colin van der Heijden',
  publisher: 'AI Speedrun',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    siteName: 'AI Speedrun',
  },
  twitter: {
    card: 'summary_large_image',
  },
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
