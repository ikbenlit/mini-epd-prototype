/**
 * Experiment CTA Component
 * 
 * Call-to-action section at the end of the manifesto.
 * Subtle buttons, no aggressive colors or fake urgency.
 * Follows design specs: large typography, centered, minimal styling.
 */

import Link from 'next/link'
import type { CTAContent } from '@/content/schemas/manifesto'

interface ExperimentCTAProps {
  content: CTAContent
}

export function ExperimentCTA({ content }: ExperimentCTAProps) {
  return (
    <section className="py-12 md:py-16 px-4 text-center bg-white" aria-labelledby="cta-heading">
      <div className="max-w-4xl mx-auto">
        <h2 
          id="cta-heading"
          className="text-5xl md:text-7xl font-black mb-3 md:mb-6 text-slate-900 font-sans"
        >
          {content.heading}
        </h2>
        
        {content.subheading && (
          <p className="text-xl md:text-2xl text-slate-600 mb-6 md:mb-8 font-serif max-w-2xl mx-auto">
            {content.subheading}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center" role="group" aria-label="Actie knoppen">
          {/* Primary Button - Subtle dark background */}
          <Link
            href={content.primaryButton.href}
            className="px-8 py-4 bg-slate-900 text-white font-semibold text-base font-sans rounded-md hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-slate-900 focus-visible:outline-offset-2 min-w-[200px] text-center"
            aria-label={content.primaryButton.text}
          >
            {content.primaryButton.text}
          </Link>
          
          {/* Secondary Button - Subtle outline */}
          <Link
            href={content.secondaryButton.href}
            className="px-8 py-4 bg-white text-slate-900 font-semibold text-base font-sans border-2 border-slate-900 rounded-md hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-slate-900 focus-visible:outline-offset-2 min-w-[200px] text-center"
            aria-label={content.secondaryButton.text}
          >
            {content.secondaryButton.text}
          </Link>
        </div>
      </div>
    </section>
  )
}

