/**
 * Content Loader Utility
 * 
 * Loads JSON content files from the content directory structure.
 * Supports server-side loading with TypeScript type safety.
 * Also supports loading and parsing markdown files.
 * 
 * @example
 * ```ts
 * const manifesto = await getContent<ManifestoContent>('nl', 'manifesto')
 * const markdownSections = await getMarkdownContent('docs/manifesto.md')
 * ```
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import { markdownToSections } from './markdown-parser'

export async function getContent<T>(
  locale: string = 'nl',
  file: string
): Promise<T> {
  try {
    const content = await import(`@/content/${locale}/${file}.json`)
    return content.default as T
  } catch (error) {
    console.error(`Failed to load content: ${locale}/${file}.json`, error)
    throw new Error(`Content not found: ${locale}/${file}.json`)
  }
}

/**
 * Load and parse markdown file to ManifestoSection format
 * Useful for converting manifesto.md to React components
 */
export async function getMarkdownContent(
  filePath: string
): Promise<Array<{
  id: string
  type: 'paragraph'
  content: string
}>> {
  try {
    const fullPath = join(process.cwd(), filePath)
    const markdown = await readFile(fullPath, 'utf-8')
    return markdownToSections(markdown)
  } catch (error) {
    console.error(`Failed to load markdown: ${filePath}`, error)
    throw new Error(`Markdown file not found: ${filePath}`)
  }
}

/**
 * Type-safe content loader with fallback
 * 
 * Returns default content if file is not found (useful for development)
 */
export async function getContentWithFallback<T>(
  locale: string = 'nl',
  file: string,
  fallback: T
): Promise<T> {
  try {
    return await getContent<T>(locale, file)
  } catch (error) {
    console.warn(`Using fallback content for: ${locale}/${file}.json`)
    return fallback
  }
}

