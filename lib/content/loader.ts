/**
 * Content Loader Utility
 * 
 * Loads JSON content files from the content directory structure.
 * Supports server-side loading with TypeScript type safety.
 * 
 * @example
 * ```ts
 * const manifesto = await getContent<ManifestoContent>('nl', 'manifesto')
 * ```
 */

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

