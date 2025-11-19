/**
 * Releases Layout
 *
 * Layout for release notes pages with sidebar navigation
 */

import type { ReactNode } from 'react'
import { getAllReleases, getCategoryMetadata } from '@/lib/mdx/releases'
import { ReleaseSidebar } from './components/release-sidebar'

interface ReleasesLayoutProps {
  children: ReactNode
}

export default async function ReleasesLayout({ children }: ReleasesLayoutProps) {
  const releases = await getAllReleases()
  const metadata = await getCategoryMetadata()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex">
          {/* Sidebar - hidden on mobile, fixed on desktop */}
          <ReleaseSidebar releases={releases} metadata={metadata} />

          {/* Main Content */}
          <div className="flex-1 lg:ml-64">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
