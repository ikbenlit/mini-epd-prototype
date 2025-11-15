/**
 * Statement Section Component
 * 
 * Full-width section with dark background for impactful statements.
 * Used to highlight key messages in the manifesto.
 */

import type { StatementSection as StatementSectionType } from '@/content/schemas/manifesto'

interface StatementSectionProps {
  section: StatementSectionType
}

export function StatementSection({ section }: StatementSectionProps) {
  const isDark = section.variant === 'dark' || !section.variant
  
  return (
    <section
      className={`w-full ${
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      }`}
      style={{
        padding: '4rem 2rem',
      }}
      aria-labelledby={`statement-${section.id}`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2
          id={`statement-${section.id}`}
          className={`font-bold mb-4 md:mb-6 font-serif ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
          style={{
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          {section.heading}
        </h2>
        <p
          className={`text-lg md:text-xl font-serif leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {section.content}
        </p>
      </div>
    </section>
  )
}

