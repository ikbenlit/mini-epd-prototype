import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from '@/components/ui/toaster';

// Serif font voor long-form content (manifesto) - lokaal geladen om build zonder netwerk te laten slagen
const crimsonText = localFont({
  variable: "--font-serif",
  display: "swap",
  src: [
    {
      path: "../docs/fonts/Lora-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../docs/fonts/Lora-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../docs/fonts/Lora-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
});

// Sans-serif font voor UI, nav, metadata
const inter = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    {
      path: "../docs/fonts/roboto-v47-latin-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../docs/fonts/roboto-v47-latin-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../docs/fonts/roboto-v47-latin-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../docs/fonts/roboto-v47-latin-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../docs/fonts/roboto-v47-latin-500italic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../docs/fonts/roboto-v47-latin-600italic.woff2",
      weight: "600",
      style: "italic",
    },
  ],
});

// Mono font voor tech details, numbers
const jetBrainsMono = localFont({
  variable: "--font-mono",
  display: "swap",
  src: [
    {
      path: "../docs/fonts/source-code-pro-v30-latin-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../docs/fonts/source-code-pro-v30-latin-600.woff2",
      weight: "600",
      style: "normal",
    },
  ],
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
  icons: {
    icon: [
      { url: '/images/aispeedrun-logo.webp', type: 'image/webp' },
    ],
    apple: '/images/aispeedrun-logo.webp',
  },
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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aispeedrun.vercel.app'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'AI Speedrun',
      url: siteUrl,
      description: 'AI-powered EPD development experiment - bouw een EPD in 4 weken voor €200',
      founder: {
        '@type': 'Person',
        name: 'Colin van der Heijden',
        url: 'https://ikbenlit.nl',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'AI Speedrun',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'nl-NL',
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${crimsonText.variable} ${inter.variable} ${jetBrainsMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
