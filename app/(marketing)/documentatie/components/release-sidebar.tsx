'use client'

/**
 * Release Sidebar Navigation
 *
 * Fixed sidebar with grouped list of all releases
 * Auto-generated from MDX files
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, ChevronDown, ChevronLeft, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { ReleaseNote, GroupMetadata, CategoryMetadata, TocItem } from '@/lib/mdx/documentatie'

interface ReleaseSidebarProps {
  releases: ReleaseNote[]
  metadata: {
    groups: GroupMetadata[]
    categories: CategoryMetadata[]
  }
  tocMap: Record<string, TocItem[]>
}

export function ReleaseSidebar({ releases, metadata, tocMap }: ReleaseSidebarProps) {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    foundation: true,
    architecture: true,
    features: true,
    infrastructure: true,
    bugs: true,
  })

  // Auto-close sidebar on navigation
  useEffect(() => {
    setIsExpanded(false)
  }, [pathname])

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
      {/* MOBILE: Overlay when expanded */}
      {isExpanded && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 top-16"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      {/* MOBILE: Collapsible sidebar from left */}
      <aside 
        className={`
          lg:hidden
          fixed top-16 bottom-0 left-0 z-40
          bg-white border-r border-slate-200
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-80 shadow-2xl' : 'w-12'}
        `}
      >
        {/* Collapsed state: Icon bar */}
        {!isExpanded && (
          <div className="flex flex-col items-center pt-6">
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 rounded-lg hover:bg-teal-50 transition-colors group"
              aria-label="Open documentatie menu"
            >
              <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-teal-600 transition-colors" />
            </button>
          </div>
        )}

        {/* Expanded state: Full navigation */}
        {isExpanded && (
          <div className="p-6 overflow-y-auto h-full">
            {/* Header met close button */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Documentatie</h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors group"
                aria-label="Sluit menu"
              >
                <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-700 transition-colors" />
              </button>
            </div>

            <nav className="space-y-1">
              {/* Overzicht link */}
              <Link
                href="/documentatie"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/documentatie' && !isReleaseDetail
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Overzicht</span>
              </Link>

              {/* Grouped releases */}
              {metadata?.groups && metadata.groups
                .sort((a, b) => a.order - b.order)
                .map((group) => {
                  const groupReleases = releasesByGroup[group.id] || []
                  const isGroupExpanded = expandedGroups[group.id]

                  return (
                    <div key={group.id} className="space-y-1">
                      {/* Group header */}
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors"
                      >
                        <span>{group.title}</span>
                        {isGroupExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      {/* Group items */}
                      {isGroupExpanded && (
                        <div className="space-y-1 ml-2">
                          {groupReleases.map((release) => {
                            const isActive = pathname === `/documentatie/${release.slug}`
                            const toc = tocMap[release.slug] || []

                            return (
                              <div key={release.slug}>
                                <Link
                                  href={`/documentatie/${release.slug}`}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                                    isActive
                                      ? 'bg-teal-50 text-teal-700'
                                      : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <StatusDot status={release.frontmatter.status} />
                                    <span className="whitespace-normal">{release.frontmatter.title}</span>
                                  </div>
                                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-opacity ${
                                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                                  }`} />
                                </Link>

                                {/* Table of Contents for active page */}
                                {isActive && toc.length > 0 && (
                                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-teal-200">
                                    {toc.map((item) => (
                                      <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className={`block py-1.5 text-xs text-slate-600 hover:text-teal-600 transition-colors ${
                                          item.level === 2 ? 'pl-3 font-medium' : 'pl-6'
                                        }`}
                                      >
                                        {item.text}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
            </nav>
          </div>
        )}
      </aside>

      {/* DESKTOP: Fixed sidebar */}
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
            {metadata?.groups && metadata.groups
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
                          const toc = tocMap[release.slug] || []

                          return (
                            <div key={release.slug}>
                              <Link
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

                              {/* Table of Contents for active page */}
                              {isActive && toc.length > 0 && (
                                <div className="ml-4 mt-1 space-y-1 border-l-2 border-teal-200">
                                  {toc.map((item) => (
                                    <a
                                      key={item.id}
                                      href={`#${item.id}`}
                                      className={`block py-1.5 text-xs text-slate-600 hover:text-teal-600 transition-colors ${
                                        item.level === 2 ? 'pl-3 font-medium' : 'pl-6'
                                      }`}
                                    >
                                      {item.text}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
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
