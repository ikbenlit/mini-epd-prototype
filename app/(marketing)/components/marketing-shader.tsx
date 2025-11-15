'use client'

/**
 * Marketing Shader Component
 * 
 * Wrapper around DotScreenShader for marketing pages.
 * Very subtle opacity (0.02) for hero sections.
 * Includes mobile fallback and reduced motion support.
 */

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Lazy load the shader component (heavy, only load when needed)
const DotScreenShader = dynamic(
  () => import('@/components/ui/dot-shader-background').then((mod) => ({ default: mod.DotScreenShader })),
  { 
    ssr: false,
    loading: () => null
  }
)

interface MarketingShaderProps {
  variant?: 'hero' | 'section'
  className?: string
}

export function MarketingShader({ variant = 'hero', className = '' }: MarketingShaderProps) {
  const [mounted, setMounted] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    // Check for mobile (simple check)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Fallback voor mobile of reduced motion
  // Voor hero variant: donkere achtergrond, voor section variant: lichte achtergrond
  if (!mounted || reducedMotion || isMobile) {
    const fallbackBg = variant === 'hero' 
      ? 'bg-slate-900' // Donkere achtergrond voor hero
      : 'bg-gradient-to-br from-slate-50 to-slate-100' // Lichte achtergrond voor sections
    
    return (
      <div 
        className={`absolute inset-0 ${fallbackBg} ${className}`}
        aria-hidden="true"
      />
    )
  }

  // Desktop: shader component met zeer subtiele opacity
  // Opacity 0.02 is zeer subtiel - bijna onzichtbaar maar aanwezig
  return (
    <div 
      className={`absolute inset-0 overflow-hidden ${className}`} 
      aria-hidden="true"
      style={{ opacity: variant === 'hero' ? 0.02 : 0.03 }}
    >
      <DotScreenShader />
    </div>
  )
}

