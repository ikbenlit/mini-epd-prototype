'use client'

/**
 * Reading Progress Bar Component
 * 
 * Fixed top progress indicator that shows scroll progress through the page.
 * Smooth animation, 2px height, accent blue color.
 * Respects prefers-reduced-motion for accessibility.
 */

import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)

    const updateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      
      // Calculate scroll progress percentage
      const scrollableHeight = documentHeight - windowHeight
      const currentProgress = scrollableHeight > 0 
        ? (scrollTop / scrollableHeight) * 100 
        : 0
      
      setProgress(Math.min(100, Math.max(0, currentProgress)))
    }

    // Initial calculation
    updateProgress()

    // Update on scroll
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress, { passive: true })

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <div
      className="fixed top-[64px] left-0 right-0 z-50 h-0.5 bg-slate-200"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Leesvoortgang"
    >
      <div
        className={`h-full bg-blue-500 ${reducedMotion ? '' : 'transition-all duration-150 ease-out'}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

