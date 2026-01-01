/**
 * Sitemap Generator
 *
 * Generates sitemap.xml for SEO.
 * Next.js will automatically serve this at /sitemap.xml
 */

import type { MetadataRoute } from 'next'
import { getAllReleases } from '@/lib/mdx/documentatie'
import { getAllPosts, getAllSeries } from '@/lib/mdx/blog'

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

  // Fetch all blog posts dynamically
  const posts = await getAllPosts()
  const postUrls: MetadataRoute.Sitemap = posts.map((post) => {
    const postDate = new Date(post.frontmatter.date)
    const isValidDate = !isNaN(postDate.getTime())

    return {
      url: `${baseUrl}/blog/serie/${post.seriesId}/${post.slug}`,
      lastModified: isValidDate ? postDate : currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    }
  })

  // Fetch all blog series
  const series = await getAllSeries()
  const seriesUrls: MetadataRoute.Sitemap = series.map((serie) => ({
    url: `${baseUrl}/blog/serie/${serie.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/documentatie`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...seriesUrls,
    ...postUrls,
    ...releaseUrls,
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}

