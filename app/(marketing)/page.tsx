/**
 * Manifesto Homepage
 * 
 * Main landing page for the AI Speedrun manifesto website.
 * This page will display the long-form manifesto content.
 * 
 * Performance optimizations:
 * - Lazy load components below the fold (ComparisonTable, ExperimentCTA)
 * - Critical content (Hero, ManifestoContent) loads immediately
 */

import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getContent } from '@/lib/content/loader'
import type { ManifestoContent, MetadataContent } from '@/content/schemas/manifesto'
import { HeroQuote } from './components/hero-quote'
import { ManifestoContent as ManifestoContentComponent } from './components/manifesto-content'
import { StructuredData } from './components/structured-data'

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

// Lazy load components below the fold for better initial load performance
const ComparisonTable = dynamic(
  () => import('./components/comparison-table').then((mod) => ({ default: mod.ComparisonTable })),
  { 
    ssr: true, // Still SSR for SEO, but code-split
    loading: () => (
      <div className="w-full md:max-w-[750px] mx-auto px-4 md:px-16 my-12 md:my-16">
        <div className="h-64 bg-slate-50 animate-pulse rounded-lg" />
      </div>
    )
  }
)

const ExperimentCTA = dynamic(
  () => import('./components/experiment-cta').then((mod) => ({ default: mod.ExperimentCTA })),
  { 
    ssr: true, // Still SSR for SEO, but code-split
    loading: () => (
      <section className="py-24 px-4 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="h-16 bg-slate-100 animate-pulse rounded-lg mb-8" />
          <div className="flex gap-4 justify-center">
            <div className="h-12 w-48 bg-slate-200 animate-pulse rounded-md" />
            <div className="h-12 w-48 bg-slate-200 animate-pulse rounded-md" />
          </div>
        </div>
      </section>
    )
  }
)

export default async function ManifestoPage() {
  const content = await getContent<ManifestoContent>('nl', 'manifesto')
  
  return (
    <>
      {/* Structured data for SEO */}
      <StructuredData content={content} />
      
      <HeroQuote content={content.hero} />
      <ManifestoContentComponent sections={content.sections} />
      <div className="w-full md:max-w-[750px] mx-auto px-4 md:px-16">
        <ComparisonTable content={content.comparison} />
      </div>
      <ExperimentCTA content={content.cta} />
    </>
  )
}

