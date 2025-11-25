/**
 * Release Notes MDX Utilities
 *
 * Functions for loading and parsing release note MDX files
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const RELEASES_DIR = path.join(process.cwd(), 'content/nl/documentatie')

export interface ReleaseFrontmatter {
  title: string
  category: string
  group: 'foundation' | 'features' | 'infrastructure' | 'bugs'
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

  // Sort by group order, then by status (completed first), then alphabetically
  return releases.sort((a, b) => {
    const groupOrder = { foundation: 1, features: 2, infrastructure: 3, bugs: 4 }
    const statusOrder = { completed: 1, in_progress: 2, planned: 3 }

    // 1. Sort by group
    const aGroupOrder = groupOrder[a.frontmatter.group]
    const bGroupOrder = groupOrder[b.frontmatter.group]
    if (aGroupOrder !== bGroupOrder) return aGroupOrder - bGroupOrder

    // 2. Sort by status (completed first, then in_progress, then planned)
    const aStatusOrder = statusOrder[a.frontmatter.status] ?? 4
    const bStatusOrder = statusOrder[b.frontmatter.status] ?? 4
    if (aStatusOrder !== bStatusOrder) return aStatusOrder - bStatusOrder

    // 3. Sort alphabetically within same status
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
 * Get releases grouped by their group (foundation, features, infrastructure, bugs)
 */
export async function getReleasesGrouped() {
  const releases = await getAllReleases()

  return {
    foundation: releases.filter(r => r.frontmatter.group === 'foundation'),
    features: releases.filter(r => r.frontmatter.group === 'features'),
    infrastructure: releases.filter(r => r.frontmatter.group === 'infrastructure'),
    bugs: releases.filter(r => r.frontmatter.group === 'bugs'),
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
  try {
    const indexPath = path.join(RELEASES_DIR, '_index.json')

    if (!fs.existsSync(indexPath)) {
      console.warn('_index.json not found, returning empty metadata')
      return {
        groups: [],
        categories: []
      }
    }

    const indexContent = fs.readFileSync(indexPath, 'utf-8')
    return JSON.parse(indexContent)
  } catch (error) {
    console.error('Error loading category metadata:', error)
    return {
      groups: [],
      categories: []
    }
  }
}

/**
 * Generate slug from heading text (must match the slugify function in mdx-components.tsx)
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

/**
 * Table of Contents item
 */
export interface TocItem {
  id: string
  text: string
  level: number
}

/**
 * Extract headings from MDX content for Table of Contents
 * Extracts h1, h2, and h3 headings, filtered for main sections
 */
export function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const headings: TocItem[] = []
  let match

  // Main sections to include in TOC (h2 level)
  const includedH2Sections = [
    'overview',
    'standaard-compliance',
    'geimplementeerde-resources',
    'relaties-tussen-resources',
    'privacy-beveiliging',
    'roadmap',
    'patient-api',
    'practitioner-api',
    'encounter-api',
    'condition-api',
    'observation-api',
    'careplan-api',
    'authenticatie-autorisatie',
    'error-handling',
  ]

  // Resource subsections to include (h3 level)
  const includedH3Sections = [
    '1-practitioners-behandelaren',
    '2-organizations-instellingen',
    '3-patients-patientenclienten',
    '4-encounters-contactmomenten',
    '5-conditions-diagnoses',
    '6-observations-metingen-en-observaties',
    '7-careplans-behandelplannen',
  ]

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .trim()

    const id = slugify(text)

    // Include h2 headings from the main sections list
    if (level === 2 && includedH2Sections.includes(id)) {
      headings.push({
        id,
        text,
        level,
      })
    }
    // Include h3 headings from the resource sections list
    else if (level === 3 && includedH3Sections.includes(id)) {
      headings.push({
        id,
        text,
        level,
      })
    }
  }

  return headings
}
