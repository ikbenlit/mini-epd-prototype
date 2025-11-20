/**
 * Releases Layout
 *
 * Layout for release notes pages with sidebar navigation
 */

import type { ReactNode } from 'react'
import { getAllReleases, getCategoryMetadata, type ReleaseNote } from '@/lib/mdx/documentatie'
import ReleaseSidebarWrapper from './components/release-sidebar-wrapper'

interface ReleasesLayoutProps {
  children: ReactNode
}

export default async function ReleasesLayout({ children }: ReleasesLayoutProps) {
  let releases: ReleaseNote[] = []
  let metadata = { groups: [], categories: [] } as Awaited<ReturnType<typeof getCategoryMetadata>>

  try {
    releases = await getAllReleases()
    metadata = await getCategoryMetadata()
  } catch (error) {
    console.error('Error loading releases or metadata:', error)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar is sticky, so we need padding for header only */}
      <div className="pt-16 lg:pt-0">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex">
            {/* Sidebar - collapsible on mobile (48px collapsed), fixed on desktop (320px) */}
            <ReleaseSidebarWrapper releases={releases} metadata={metadata} />

            {/* Main Content - margin for collapsed sidebar on mobile, fixed sidebar on desktop */}
            <div className="flex-1 ml-12 lg:ml-80">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
