/**
 * Markdown Parser Utility
 * 
 * Simple markdown parser for converting manifesto.md content
 * to React components with proper typography.
 * 
 * This is a lightweight parser for basic markdown features:
 * - Paragraphs
 * - Line breaks
 * - Basic formatting (bold, italic)
 */

export interface ParsedMarkdown {
  paragraphs: string[]
  metadata?: Record<string, string>
}

/**
 * Parse markdown content into structured format
 * Splits content by double line breaks into paragraphs
 */
export function parseMarkdown(markdown: string): ParsedMarkdown {
  // Split by double line breaks or single line breaks followed by empty line
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter((para) => para.length > 0)

  return {
    paragraphs,
  }
}

/**
 * Convert markdown paragraphs to ManifestoSection format
 * This allows markdown content to be used with existing components
 */
export function markdownToSections(markdown: string): Array<{
  id: string
  type: 'paragraph'
  content: string
}> {
  const parsed = parseMarkdown(markdown)
  
  return parsed.paragraphs.map((content, index) => ({
    id: `paragraph-${index + 1}`,
    type: 'paragraph' as const,
    content: content.trim(),
  }))
}

/**
 * Simple markdown renderer for inline formatting
 * Converts **bold** and *italic* to HTML
 */
export function renderMarkdownInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}

