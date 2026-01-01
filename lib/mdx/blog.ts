/**
 * Blog MDX Utilities
 *
 * Functions for loading and parsing blog MDX files with series support
 * Based on lib/mdx/documentatie.ts
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/nl/blog')

// ============================================================================
// Types
// ============================================================================

export interface BlogSeries {
  id: string
  title: string
  description: string
  color: 'teal' | 'amber' | 'slate'
  order: number
  status: 'active' | 'completed' | 'planned'
}

export interface BlogFrontmatter {
  title: string
  description: string
  date: string
  published?: boolean
  seriesOrder: number
  tags?: string[]
  image?: string // Optional OG image path (relative to /public, e.g. "/images/blog/my-post.png")
}

export interface BlogPost {
  slug: string
  seriesId: string
  frontmatter: BlogFrontmatter
  content: string
  readingTime: number
}

export interface SeriesNavigation {
  previous: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
  current: number
  total: number
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// ============================================================================
// Series Functions
// ============================================================================

/**
 * Get all series metadata
 */
export async function getAllSeries(): Promise<BlogSeries[]> {
  try {
    const seriesPath = path.join(BLOG_DIR, '_series.json')

    if (!fs.existsSync(seriesPath)) {
      console.warn('_series.json not found')
      return []
    }

    const content = fs.readFileSync(seriesPath, 'utf-8')
    const data = JSON.parse(content)

    return (data.series || []).sort(
      (a: BlogSeries, b: BlogSeries) => a.order - b.order
    )
  } catch (error) {
    console.error('Error loading series:', error)
    return []
  }
}

/**
 * Get a single series by ID
 */
export async function getSeries(seriesId: string): Promise<BlogSeries | null> {
  const allSeries = await getAllSeries()
  return allSeries.find((s) => s.id === seriesId) || null
}

// ============================================================================
// Post Functions
// ============================================================================

/**
 * Get all blog posts from all series
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  if (!fs.existsSync(BLOG_DIR)) return []

  const series = await getAllSeries()
  const allPosts: BlogPost[] = []

  for (const serie of series) {
    const serieDir = path.join(BLOG_DIR, serie.id)

    if (!fs.existsSync(serieDir)) continue

    const files = fs.readdirSync(serieDir).filter((f) => f.endsWith('.mdx'))

    for (const file of files) {
      const slug = file.replace('.mdx', '')
      const filePath = path.join(serieDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)
      const frontmatter = data as BlogFrontmatter

      // Skip unpublished in production
      if (
        process.env.NODE_ENV !== 'development' &&
        frontmatter.published === false
      ) {
        continue
      }

      allPosts.push({
        slug,
        seriesId: serie.id,
        frontmatter,
        content,
        readingTime: calculateReadingTime(content),
      })
    }
  }

  // Sort by date, newest first
  return allPosts.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime()
  )
}

/**
 * Get all posts for a specific series
 */
export async function getPostsBySeries(seriesId: string): Promise<BlogPost[]> {
  const serieDir = path.join(BLOG_DIR, seriesId)

  if (!fs.existsSync(serieDir)) return []

  const files = fs.readdirSync(serieDir).filter((f) => f.endsWith('.mdx'))
  const posts: BlogPost[] = []

  for (const file of files) {
    const slug = file.replace('.mdx', '')
    const filePath = path.join(serieDir, file)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)
    const frontmatter = data as BlogFrontmatter

    // Skip unpublished in production
    if (
      process.env.NODE_ENV !== 'development' &&
      frontmatter.published === false
    ) {
      continue
    }

    posts.push({
      slug,
      seriesId,
      frontmatter,
      content,
      readingTime: calculateReadingTime(content),
    })
  }

  // Sort by seriesOrder
  return posts.sort(
    (a, b) => a.frontmatter.seriesOrder - b.frontmatter.seriesOrder
  )
}

/**
 * Get a single post
 */
export async function getPost(
  seriesId: string,
  slug: string
): Promise<BlogPost | null> {
  const filePath = path.join(BLOG_DIR, seriesId, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) return null

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)
  const frontmatter = data as BlogFrontmatter

  return {
    slug,
    seriesId,
    frontmatter,
    content,
    readingTime: calculateReadingTime(content),
  }
}

/**
 * Get navigation for a post within its series
 */
export async function getSeriesNavigation(
  seriesId: string,
  slug: string
): Promise<SeriesNavigation> {
  const posts = await getPostsBySeries(seriesId)
  const currentIndex = posts.findIndex((p) => p.slug === slug)

  return {
    previous:
      currentIndex > 0
        ? { slug: posts[currentIndex - 1].slug, title: posts[currentIndex - 1].frontmatter.title }
        : null,
    next:
      currentIndex < posts.length - 1
        ? { slug: posts[currentIndex + 1].slug, title: posts[currentIndex + 1].frontmatter.title }
        : null,
    current: currentIndex + 1,
    total: posts.length,
  }
}

/**
 * Get series with post counts
 */
export async function getSeriesWithCounts(): Promise<
  (BlogSeries & { postCount: number })[]
> {
  const series = await getAllSeries()
  const result = []

  for (const serie of series) {
    const posts = await getPostsBySeries(serie.id)
    result.push({
      ...serie,
      postCount: posts.length,
    })
  }

  return result
}

