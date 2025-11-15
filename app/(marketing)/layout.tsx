/**
 * Marketing Layout
 * 
 * Full-width layout without sidebar for marketing pages.
 * Navigation will be added in E1.M5.S1.
 */

import type { ReactNode } from 'react'

interface MarketingLayoutProps {
  children: ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation will be added in E1.M5.S1 */}
      {children}
    </div>
  )
}

