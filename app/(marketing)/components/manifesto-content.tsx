/**
 * Manifesto Content Component
 * 
 * Long-form reading experience with manifesto text.
 * Renders paragraphs with proper typography for optimal reading.
 */

import type { ManifestoSection } from '@/content/schemas/manifesto'
import { InsightBox } from './insight-box'
import { StatementSection } from './statement-section'

interface ManifestoContentProps {
  sections: ManifestoSection[]
}

export function ManifestoContent({ sections }: ManifestoContentProps) {
  // Group consecutive non-statement sections into article blocks
  const blocks: Array<{ start: number; end: number }> = []
  let blockStart = 0
  
  sections.forEach((section, index) => {
    if (section.type === 'statement') {
      if (blockStart < index) {
        blocks.push({ start: blockStart, end: index - 1 })
      }
      blockStart = index + 1
    }
  })
  
  // Add final block if needed
  if (blockStart < sections.length) {
    blocks.push({ start: blockStart, end: sections.length - 1 })
  }
  
  let blockIndex = 0
  
  return (
    <>
      {sections.map((section, index) => {
        // Statement sections are full-width
        if (section.type === 'statement') {
          return <StatementSection key={section.id} section={section} />
        }
        
        // Check if this is the start of a new article block
        const currentBlock = blocks[blockIndex]
        const isBlockStart = currentBlock && index === currentBlock.start
        
        if (isBlockStart) {
          const blockSections = sections.slice(currentBlock.start, currentBlock.end + 1)
          blockIndex++
          
          return (
            <article
              key={`block-${currentBlock.start}`}
              className="w-full md:max-w-[750px] mx-auto px-4 py-6 md:px-16 md:py-16 bg-white"
            >
              <div className="prose prose-lg max-w-none">
                {blockSections.map((blockSection) => {
                  if (blockSection.type === 'paragraph') {
                    return (
                      <p
                        key={blockSection.id}
                        className="font-serif text-slate-900 mb-4 md:mb-6"
                        style={{
                          fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
                          lineHeight: 'var(--line-height-relaxed)',
                        }}
                      >
                        {blockSection.content}
                      </p>
                    )
                  }
                  
                  if (blockSection.type === 'insight') {
                    return (
                      <InsightBox key={blockSection.id}>
                        {blockSection.content}
                      </InsightBox>
                    )
                  }
                  
                  return null
                })}
              </div>
            </article>
          )
        }
        
        return null
      })}
    </>
  )
}

