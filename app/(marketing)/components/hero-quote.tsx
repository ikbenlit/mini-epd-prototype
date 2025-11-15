/**
 * Hero Quote Component
 * 
 * Full-viewport hero section with Jensen Huang quote.
 * Displays quote, attribution, and subtitle from content.
 */

import type { HeroContent } from '@/content/schemas/manifesto'
import { MarketingShader } from './marketing-shader'

interface HeroQuoteProps {
  content: HeroContent
}

export function HeroQuote({ content }: HeroQuoteProps) {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center bg-slate-900"
      style={{ backgroundColor: '#0F172A' }} // Expliciet donkere achtergrond voor maximum contrast
      aria-label="Hero quote sectie"
    >
      {/* Shader Background - zeer subtiel (opacity 0.02) */}
      {/* Op mobile: donkere fallback, op desktop: subtiele shader */}
      <MarketingShader variant="hero" className="z-0" />
      
      {/* Content Overlay */}
      <div className="relative z-10 w-full max-w-4xl px-4 md:px-8 text-center pt-20 md:pt-0">
        <blockquote 
          className="text-white font-serif italic mb-4 md:mb-6" 
          style={{ 
            fontSize: 'clamp(1.5rem, 5vw, 4rem)', // Mobile: smaller, Desktop: larger
            lineHeight: 'var(--line-height-tight)',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)', // Sterkere shadow voor beter contrast
            color: '#FFFFFF', // Expliciet wit voor maximum contrast
          }}
          cite={content.attribution}
        >
          "{content.quote}"
        </blockquote>
        
        <div className="text-white font-sans text-sm md:text-base" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)' }}>
          <cite className="not-italic font-semibold text-base md:text-lg text-white">
            {content.attribution}
          </cite>
          {content.attributionContext && (
            <span className="text-slate-200 text-sm md:text-base ml-2" aria-hidden="true">
              {content.attributionContext}
            </span>
          )}
        </div>
        
        <p className="text-white mt-4 md:mt-6 text-base md:text-xl font-sans" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)' }}>
          {content.subtitle}
        </p>
      </div>
    </section>
  )
}

