/**
 * Homepage - AI Speedrun v2.1
 *
 * Vereenvoudigde landing page met:
 * - Hero quote (Jensen Huang)
 * - Statement section (Software on Demand concept)
 * - Timeline (coming in E1.S3)
 * - CTA naar /login
 *
 * Performance optimizations:
 * - Critical content (Hero, Statement) loads immediately
 * - Timeline will be lazy loaded when added
 */

import type { Metadata } from 'next'
import { getContent } from '@/lib/content/loader'
import type { MetadataContent } from '@/content/schemas/manifesto'
import { HeroQuote } from './components/hero-quote'

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const metadataContent = await getContent<MetadataContent>('nl', 'metadata')
  const meta = metadataContent.manifesto
  
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aispeedrun.vercel.app'
  const ogImageUrl = `${siteUrl}${meta.ogImage}`
  
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: 'Colin van der Heijden' }],
    openGraph: {
      type: 'article',
      title: meta.ogTitle,
      description: meta.ogDescription,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: meta.ogTitle,
        },
      ],
      siteName: 'AI Speedrun',
      locale: 'nl_NL',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.ogTitle,
      description: meta.ogDescription,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: siteUrl,
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
  }
}

// Statement content interface
interface StatementContent {
  hero: {
    quote: string
    attribution: string
    attributionContext: string
    subtitle: string
  }
}

export default async function HomePage() {
  // Load hero content from existing manifesto
  const content = await getContent<StatementContent>('nl', 'manifesto')

  return (
    <>
      {/* Hero Quote Section */}
      <HeroQuote content={content.hero} />

      {/* Statement Section - Software on Demand */}
      <section className="w-full md:max-w-[750px] mx-auto px-4 md:px-16 py-16 md:py-24">
        <div className="prose prose-slate max-w-none">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-8">
            Software on Demand: Van €100k naar €200
          </h2>

          <div className="space-y-6 text-lg leading-relaxed text-slate-700">
            <p>
              <strong className="text-slate-900">Het probleem:</strong> Enterprise software kost €100.000+ per jaar
              en implementaties duren 12-24 maanden. Je betaalt voor potentieel, niet voor werkelijke waarde.
              Vendors optimaliseren voor meer seats, meer modules, meer lock-in.
            </p>

            <p>
              <strong className="text-slate-900">De oplossing:</strong> AI-powered development verkort dit naar
              4 weken en €200 totale kosten. Niet omdat AI magisch is, maar omdat je 80% van de standaard-code
              niet meer hoeft te schrijven. De kostenbasis verschuift compleet - geen armies van consultants,
              geen jarenlange developmenttrajecten.
            </p>

            <p>
              <strong className="text-slate-900">Het bewijs:</strong> Dit EPD prototype is het levende bewijs.
              Gebouwd in 4 weken, volledig transparant, build in public. Infrastructuur die schaalt met gebruik,
              AI die de heavy lifting doet. En het belangrijkste: je bezit de code, je controleert de roadmap.
            </p>

            <p className="text-teal-700 font-medium text-xl pt-4">
              Volg de voortgang hieronder en zie hoe elk onderdeel tot leven komt →
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section - Coming in E1.S3 */}
      <section id="timeline" className="w-full bg-slate-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Build in Public: 4 Weken
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Timeline komt hier in E1.S3 - volledige transparantie over voortgang, features en metrics
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 text-center bg-gradient-to-br from-teal-50 to-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Klaar om het prototype te proberen?
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Login om toegang te krijgen tot de EPD applicatie en zie AI-gestuurde workflows in actie
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="inline-block px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
            >
              Probeer het prototype
            </a>
            <a
              href="#timeline"
              className="inline-block px-8 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border-2 border-slate-300 transition-colors"
            >
              Bekijk voortgang
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

