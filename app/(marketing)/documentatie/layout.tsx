/**
 * Releases Layout
 *
 * Layout for release notes pages with sidebar navigation
 */

import type { ReactNode } from 'react'
import { getAllReleases, getCategoryMetadata } from '@/lib/mdx/documentatie'
import ReleaseSidebar from './components/release-sidebar-wrapper'

interface ReleasesLayoutProps {
  children: ReactNode
}

export default async function ReleasesLayout({ children }: ReleasesLayoutProps) {
  const releases = await getAllReleases()
  const metadata = await getCategoryMetadata()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex">
          {/* Sidebar - hidden on mobile, fixed on desktop */}
          <ReleaseSidebar releases={releases} metadata={metadata} />

          {/* Main Content */}
          <div className="flex-1 lg:ml-80">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
