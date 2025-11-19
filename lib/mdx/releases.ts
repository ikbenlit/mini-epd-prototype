/**
 * Release Notes MDX Utilities
 *
 * Functions for loading and parsing release note MDX files
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const RELEASES_DIR = path.join(process.cwd(), 'content/nl/releases')

export interface ReleaseFrontmatter {
  title: string
  category: string
  group: 'foundation' | 'features' | 'infrastructure'
  version: string
  releaseDate: string
  status: 'completed' | 'in_progress' | 'planned'
  description: string
}

export interface ReleaseNote {
  slug: string
  frontmatter: ReleaseFrontmatter
  content: string
}

/**
 * Get all release note files
 */
export async function getAllReleases(): Promise<ReleaseNote[]> {
  const files = fs.readdirSync(RELEASES_DIR)

  const releases = files
    .filter(file => file.endsWith('.mdx') && !file.startsWith('_'))
    .map(file => {
      const slug = file.replace('.mdx', '')
      const filePath = path.join(RELEASES_DIR, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)

      return {
        slug,
        frontmatter: data as ReleaseFrontmatter,
        content,
      }
    })

  // Sort by group order and then by category
  return releases.sort((a, b) => {
    const groupOrder = { foundation: 1, features: 2, infrastructure: 3 }
    const aOrder = groupOrder[a.frontmatter.group]
    const bOrder = groupOrder[b.frontmatter.group]

    if (aOrder !== bOrder) return aOrder - bOrder
    return a.frontmatter.category.localeCompare(b.frontmatter.category)
  })
}

/**
 * Get a single release by slug
 */
export async function getRelease(slug: string): Promise<ReleaseNote | null> {
  const filePath = path.join(RELEASES_DIR, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)

  return {
    slug,
    frontmatter: data as ReleaseFrontmatter,
    content,
  }
}

/**
 * Get releases grouped by their group (foundation, features, infrastructure)
 */
export async function getReleasesGrouped() {
  const releases = await getAllReleases()

  return {
    foundation: releases.filter(r => r.frontmatter.group === 'foundation'),
    features: releases.filter(r => r.frontmatter.group === 'features'),
    infrastructure: releases.filter(r => r.frontmatter.group === 'infrastructure'),
  }
}

/**
 * Get category metadata from index file
 */
export interface CategoryMetadata {
  slug: string
  title: string
  group: string
  description: string
  order: number
}

export interface GroupMetadata {
  id: string
  title: string
  description: string
  order: number
}

interface IndexData {
  groups: GroupMetadata[]
  categories: CategoryMetadata[]
}

export async function getCategoryMetadata(): Promise<IndexData> {
  const indexPath = path.join(RELEASES_DIR, '_index.json')
  const indexContent = fs.readFileSync(indexPath, 'utf-8')
  return JSON.parse(indexContent)
}
