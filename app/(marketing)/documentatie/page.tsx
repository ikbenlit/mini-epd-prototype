/**
 * Releases Overview Page
 *
 * Landing page for all release notes grouped by category
 */

import Link from 'next/link'
import { getAllReleases } from '@/lib/mdx/documentatie'

export const metadata = {
  title: 'Documentatie - AI Speedrun',
  description: 'Feature documentatie van het Mini-ECD prototype. Transparant build-in-public overzicht van gebouwde functionaliteit.',
}

export default async function ReleasesPage() {
  const releases = await getAllReleases()

  // Group by status for better overview
  const completed = releases.filter(r => r.frontmatter.status === 'completed')
  const inProgress = releases.filter(r => r.frontmatter.status === 'in_progress')
  const planned = releases.filter(r => r.frontmatter.status === 'planned')

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-8 md:mb-12 pt-20 md:pt-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 md:mb-4">
            Feature Documentatie
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed">
            Uitgebreide documentatie van alle gebouwde functionaliteit. Build in public met transparantie over features, implementatie en kosten.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-white rounded-lg border border-slate-200 p-6 text-center shadow-sm">
            <div className="text-4xl md:text-5xl font-bold text-teal-600 mb-2">{completed.length}</div>
            <div className="text-sm font-medium text-slate-600">Voltooid</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 text-center shadow-sm">
            <div className="text-4xl md:text-5xl font-bold text-amber-600 mb-2">{inProgress.length}</div>
            <div className="text-sm font-medium text-slate-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 text-center shadow-sm">
            <div className="text-4xl md:text-5xl font-bold text-slate-400 mb-2">{planned.length}</div>
            <div className="text-sm font-medium text-slate-600">Gepland</div>
          </div>
        </div>

        {/* Completed Releases */}
        {completed.length > 0 && (
          <section className="mb-10 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
              ✅ Voltooid
            </h2>
            <div className="space-y-4">
              {completed.map((release) => (
                <ReleaseCard key={release.slug} release={release} />
              ))}
            </div>
          </section>
        )}

        {/* In Progress Releases */}
        {inProgress.length > 0 && (
          <section className="mb-10 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
              🔄 In Progress
            </h2>
            <div className="space-y-4">
              {inProgress.map((release) => (
                <ReleaseCard key={release.slug} release={release} />
              ))}
            </div>
          </section>
        )}

        {/* Planned Releases */}
        {planned.length > 0 && (
          <section className="mb-10 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
              ⏳ Gepland
            </h2>
            <div className="space-y-4">
              {planned.map((release) => (
                <ReleaseCard key={release.slug} release={release} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function ReleaseCard({ release }: { release: any }) {
  return (
    <Link
      href={`/documentatie/${release.slug}`}
      className="block bg-white rounded-lg border border-slate-200 p-5 md:p-6 hover:border-teal-300 hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
              {release.frontmatter.title}
            </h3>
            <StatusBadge status={release.frontmatter.status} />
          </div>
          <p className="text-slate-600 mb-3 text-sm md:text-base leading-relaxed">
            {release.frontmatter.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-500">
            <span className="capitalize">{release.frontmatter.group.replace('-', ' ')}</span>
            <span className="hidden sm:inline">•</span>
            <span>v{release.frontmatter.version}</span>
            <span className="hidden sm:inline">•</span>
            <span className="whitespace-nowrap">{new Date(release.frontmatter.releaseDate).toLocaleDateString('nl-NL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
        </div>
        <div className="text-slate-400 flex-shrink-0 self-start sm:self-center">
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

function StatusBadge({ status }: { status: 'completed' | 'in_progress' | 'planned' }) {
  const styles = {
    completed: 'bg-teal-100 text-teal-700 border-teal-200',
    in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
    planned: 'bg-slate-100 text-slate-600 border-slate-200',
  }

  const labels = {
    completed: 'Voltooid',
    in_progress: 'Bezig',
    planned: 'Gepland',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
