/**
 * Sitemap Generator
 * 
 * Generates sitemap.xml for SEO.
 * Next.js will automatically serve this at /sitemap.xml
 */

import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aispeedrun.vercel.app'
  
  // Get current date for lastModified
  const currentDate = new Date()
  
  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // Future routes can be added here:
    // {
    //   url: `${baseUrl}/build-log`,
    //   lastModified: currentDate,
    //   changeFrequency: 'weekly',
    //   priority: 0.8,
    // },
    // {
    //   url: `${baseUrl}/demo`,
    //   lastModified: currentDate,
    //   changeFrequency: 'monthly',
    //   priority: 0.7,
    // },
  ]
}

