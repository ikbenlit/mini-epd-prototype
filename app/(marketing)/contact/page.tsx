/**
 * Contact Page - Under Construction
 */

import type { Metadata } from 'next'
import { Construction } from 'lucide-react'
import Link from 'next/link'

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aispeedrun.vercel.app'

  return {
    title: 'Contact - AI Speedrun',
    description: 'Deze pagina is momenteel in ontwikkeling.',
    openGraph: {
      type: 'website',
      title: 'Contact - AI Speedrun',
      description: 'Deze pagina is momenteel in ontwikkeling',
      images: [`${siteUrl}/og-image.png`],
      siteName: 'AI Speedrun',
      locale: 'nl_NL',
    },
    alternates: {
      canonical: `${siteUrl}/contact`,
    },
  }
}

export default function ContactPage() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-8">
          <Construction className="w-12 h-12 text-orange-600" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Pagina in ontwikkeling
        </h1>

        <p className="text-xl text-slate-600 mb-8">
          We zijn bezig met het bouwen van deze pagina. Kom binnenkort terug!
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Terug naar home
        </Link>
      </div>
    </section>
  )
}
