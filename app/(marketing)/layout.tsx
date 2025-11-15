/**
 * Marketing Layout
 * 
 * Full-width layout without sidebar for marketing pages.
 * Includes minimal navigation and reading progress bar.
 * 
 * Performance optimizations:
 * - ReadingProgress is a client component, automatically code-split by Next.js
 */

import type { ReactNode } from 'react'
import { getContent } from '@/lib/content/loader'
import type { NavigationContent } from '@/content/schemas/manifesto'
import { MinimalNav } from './components/minimal-nav'
import { ReadingProgress } from './components/reading-progress'

interface MarketingLayoutProps {
  children: ReactNode
}

export default async function MarketingLayout({ children }: MarketingLayoutProps) {
  // Load navigation content
  const navigationContent = await getContent<NavigationContent>('nl', 'navigation')
  
  return (
    <div className="min-h-screen bg-white">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-to-main">
        Spring naar hoofdinhoud
      </a>
      
      {/* Minimal Navigation - fixed top */}
      <MinimalNav content={navigationContent} />
      
      {/* Reading progress bar - fixed top, below nav */}
      {/* Client component, automatically code-split by Next.js */}
      <ReadingProgress />
      
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  )
}

