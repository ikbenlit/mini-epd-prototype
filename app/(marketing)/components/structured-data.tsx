/**
 * Structured Data Component
 * 
 * Adds JSON-LD structured data for Article schema to improve SEO.
 * Helps search engines understand the content structure.
 */

import type { ManifestoContent } from '@/content/schemas/manifesto'

interface StructuredDataProps {
  content: ManifestoContent
}

export function StructuredData({ content }: StructuredDataProps) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aispeedrun.vercel.app'
  const publishedDate = '2024-11-15' // Launch date
  const modifiedDate = new Date().toISOString().split('T')[0]
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.hero.quote,
    description: content.hero.subtitle,
    author: {
      '@type': 'Person',
      name: 'Colin van der Heijden',
      url: 'https://ikbenlit.nl',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Speedrun',
      url: siteUrl,
    },
    datePublished: publishedDate,
    dateModified: modifiedDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': siteUrl,
    },
    articleSection: 'Technology',
    keywords: ['AI', 'Software on Demand', 'EPD', 'Development', 'Build in Public'],
    inLanguage: 'nl-NL',
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

