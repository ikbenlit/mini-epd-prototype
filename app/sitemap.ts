/**
 * Sitemap Generator
 *
 * Generates sitemap.xml for SEO.
 * Next.js will automatically serve this at /sitemap.xml
 */

import type { MetadataRoute } from 'next'
import { getAllReleases } from '@/lib/mdx/documentatie'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aispeedrun.vercel.app'
  const currentDate = new Date()

  // Fetch all documentation releases dynamically
  const releases = await getAllReleases()

  const releaseUrls: MetadataRoute.Sitemap = releases.map((release) => {
    const releaseDate = new Date(release.frontmatter.releaseDate)
    const isValidDate = !isNaN(releaseDate.getTime())

    return {
      url: `${baseUrl}/documentatie/${release.slug}`,
      lastModified: isValidDate ? releaseDate : currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    }
  })

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/documentatie`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...releaseUrls,
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}

