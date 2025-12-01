import fs from 'fs/promises'
import path from 'path'

import { KnowledgeCategory } from '@/lib/docs/category-detector'

const KNOWLEDGE_DIR = path.join(process.cwd(), 'lib/docs/knowledge')

const CATEGORY_FILE_MAP: Record<KnowledgeCategory, string[]> = {
  clientbeheer: ['faq_clientbeheer.md'],
  intake: ['faq_intake.md'],
  screening: ['faq_screening.md'],
  behandelplan: ['faq_behandelplan.md'],
  spraak: ['faq_spraak.md'],
  inloggen: ['faq_inloggen.md'],
  interface: ['guidelines_interface.md'],
  technisch: ['guidelines_technisch.md'],
}

const FILE_CATEGORY_MAP = Object.entries(CATEGORY_FILE_MAP).reduce(
  (acc, [category, files]) => {
    for (const file of files) {
      acc[file] = category as KnowledgeCategory
    }
    return acc
  },
  {} as Record<string, KnowledgeCategory>
)

const DEFAULT_FILES = ['guidelines_interface.md']
const MAX_SECTIONS = 4

export interface KnowledgeSection {
  id: string
  title: string
  content: string
  category?: KnowledgeCategory
  file: string
}

const normalizeTitle = (fileName: string) =>
  fileName
    .replace(/_/g, ' ')
    .replace(/\.mdx?$/, '')
    .trim()

function extractTitle(content: string, fallback: string) {
  const match = content.match(/^#\s+(.+)$/m)
  return (match ? match[1] : fallback).trim()
}

async function readKnowledgeFile(fileName: string) {
  const filePath = path.join(KNOWLEDGE_DIR, fileName)
  const fileContent = await fs.readFile(filePath, 'utf-8')
  return fileContent.trim()
}

export async function loadKnowledgeSections(
  categories: KnowledgeCategory[],
  options?: { limit?: number; fallbackFiles?: string[] }
): Promise<KnowledgeSection[]> {
  const limit = options?.limit ?? MAX_SECTIONS
  const fallbackFiles = options?.fallbackFiles ?? DEFAULT_FILES

  const selectedFiles = new Set<string>()

  if (categories.length === 0) {
    fallbackFiles.forEach(file => selectedFiles.add(file))
  } else {
    for (const category of categories) {
      const files = CATEGORY_FILE_MAP[category] ?? []
      files.forEach(file => selectedFiles.add(file))
    }
  }

  const filesToLoad = Array.from(selectedFiles).slice(0, limit)
  const sections: KnowledgeSection[] = []

  for (const fileName of filesToLoad) {
    try {
      const raw = await readKnowledgeFile(fileName)
      if (!raw) continue

      const title = extractTitle(raw, normalizeTitle(fileName))
      sections.push({
        id: fileName.replace(/\.mdx?$/, ''),
        title,
        content: raw,
        category: FILE_CATEGORY_MAP[fileName],
        file: fileName,
      })
    } catch (error) {
      console.error(`Failed to load knowledge file ${fileName}:`, error)
    }
  }

  return sections
}
