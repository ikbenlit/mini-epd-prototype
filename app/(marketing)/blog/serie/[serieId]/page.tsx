/**
 * Series Overview Page
 *
 * Shows all posts in a specific series
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSeries, getPostsBySeries, getAllSeries } from '@/lib/mdx/blog'

interface SeriesPageProps {
  params: Promise<{ serieId: string }>
}

export async function generateStaticParams() {
  const series = await getAllSeries()
  return series.map((serie) => ({ serieId: serie.id }))
}

export async function generateMetadata({ params }: SeriesPageProps) {
  const { serieId } = await params
  const series = await getSeries(serieId)

  if (!series) {
    return { title: 'Serie niet gevonden' }
  }

  return {
    title: `${series.title} - Blog`,
    description: series.description,
  }
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { serieId } = await params
  const series = await getSeries(serieId)

  if (!series) {
    notFound()
  }

  const posts = await getPostsBySeries(serieId)

  const colorStyles = {
    teal: {
      bg: 'bg-teal-50',
      badge: 'bg-teal-100 text-teal-700 border-teal-200',
      dot: 'bg-teal-500',
      number: 'bg-teal-600 text-white',
    },
    amber: {
      bg: 'bg-amber-50',
      badge: 'bg-amber-100 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      number: 'bg-amber-600 text-white',
    },
    slate: {
      bg: 'bg-slate-50',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-500',
      number: 'bg-slate-600 text-white',
    },
  }

  const styles = colorStyles[series.color] || colorStyles.slate
  const statusLabels = {
    completed: 'Voltooid',
    active: 'Actief',
    planned: 'Gepland',
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Back link */}
        <div className="pt-20 md:pt-24 mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Terug naar blog</span>
          </Link>
        </div>

        {/* Series Header */}
        <header className={`rounded-xl p-6 md:p-8 mb-8 ${styles.bg}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles.badge}`}>
              {statusLabels[series.status]}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            {series.title}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            {series.description}
          </p>
          <div className="mt-4 text-sm text-slate-500">
            {posts.length} {posts.length === 1 ? 'deel' : 'delen'}
          </div>
        </header>

        {/* Posts List */}
        {posts.length === 0 ? (
          <p className="text-slate-500 text-center py-12">
            Nog geen posts in deze serie.
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((post, index) => (
              <Link
                key={post.slug}
                href={`/blog/serie/${serieId}/${post.slug}`}
                className="flex items-start gap-4 bg-white rounded-lg border border-slate-200 p-4 md:p-5 hover:border-teal-300 hover:shadow-md transition-all active:scale-[0.99]"
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${styles.number}`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-slate-900 mb-1 leading-tight">
                    {post.frontmatter.title}
                  </h2>
                  <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                    {post.frontmatter.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <time dateTime={post.frontmatter.date}>
                      {new Date(post.frontmatter.date).toLocaleDateString('nl-NL', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                    <span>•</span>
                    <span>{post.readingTime} min</span>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

