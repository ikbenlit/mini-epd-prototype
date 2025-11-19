'use client'

/**
 * Release Sidebar Navigation
 *
 * Fixed sidebar with grouped list of all releases
 * Auto-generated from MDX files
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { ReleaseNote, GroupMetadata, CategoryMetadata } from '@/lib/mdx/documentatie'

interface ReleaseSidebarProps {
  releases: ReleaseNote[]
  metadata: {
    groups: GroupMetadata[]
    categories: CategoryMetadata[]
  }
}

export function ReleaseSidebar({ releases, metadata }: ReleaseSidebarProps) {
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    foundation: true,
    features: true,
    infrastructure: true,
    bugs: true,
  })

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  // Group releases by their group
  const releasesByGroup = releases.reduce((acc, release) => {
    const group = release.frontmatter.group
    if (!acc[group]) acc[group] = []
    acc[group].push(release)
    return acc
  }, {} as Record<string, ReleaseNote[]>)

  // Check if we're on a specific release page
  const isReleaseDetail = pathname.startsWith('/documentatie/') && pathname !== '/documentatie'

  return (
    <>
      {/* Mobile: Horizontal scroll menu */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="flex gap-2 p-4 overflow-x-auto">
          <Link
            href="/documentatie"
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/documentatie'
                ? 'bg-teal-100 text-teal-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Overzicht
          </Link>
          {releases.map((release) => (
            <Link
              key={release.slug}
              href={`/documentatie/${release.slug}`}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === `/documentatie/${release.slug}`
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {release.frontmatter.title}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: Fixed sidebar */}
      <aside className="hidden lg:block w-80 fixed top-16 bottom-0 bg-white border-r border-slate-200 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Documentatie
          </h2>

          <nav className="space-y-1">
            {/* Overview link */}
            <Link
              href="/documentatie"
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/documentatie' && !isReleaseDetail
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              <span>Overzicht</span>
            </Link>

            {/* Grouped releases */}
            {metadata.groups
              .sort((a, b) => a.order - b.order)
              .map((group) => {
                const groupReleases = releasesByGroup[group.id] || []
                const isExpanded = expandedGroups[group.id]

                return (
                  <div key={group.id} className="space-y-1">
                    {/* Group header */}
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                    >
                      <span>{group.title}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {/* Group items */}
                    {isExpanded && (
                      <div className="space-y-1 ml-2">
                        {groupReleases.map((release) => {
                          const isActive = pathname === `/documentatie/${release.slug}`

                          return (
                            <Link
                              key={release.slug}
                              href={`/documentatie/${release.slug}`}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${isActive
                                  ? 'bg-teal-50 text-teal-700'
                                  : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <StatusDot status={release.frontmatter.status} />
                                <span className="whitespace-normal">{release.frontmatter.title}</span>
                              </div>
                              <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                                }`} />
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
          </nav>
        </div>
      </aside>
    </>
  )
}

function StatusDot({ status }: { status: 'completed' | 'in_progress' | 'planned' }) {
  const colors = {
    completed: 'bg-teal-500',
    in_progress: 'bg-amber-500',
    planned: 'bg-slate-300',
  }

  return (
    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status]}`} />
  )
}
