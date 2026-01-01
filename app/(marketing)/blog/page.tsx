/**
 * Blog Overview Page
 *
 * Landing page with series cards and recent posts
 */

import Link from 'next/link'
import { getAllPosts, getSeriesWithCounts, type BlogSeries } from '@/lib/mdx/blog'

export const metadata = {
  title: 'Blog - AI Speedrun',
  description: 'Artikelen over AI-gestuurde software ontwikkeling, healthcare IT en het bouwen van een EPD.',
  openGraph: {
    title: 'Blog - AI Speedrun',
    description: 'Artikelen over AI-gestuurde software ontwikkeling, healthcare IT en het bouwen van een EPD.',
    type: 'website',
    siteName: 'AI Speedrun',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary',
    title: 'Blog - AI Speedrun',
    description: 'Artikelen over AI-gestuurde software ontwikkeling, healthcare IT en het bouwen van een EPD.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://aispeedrun.vercel.app'}/blog`,
  },
}

export default async function BlogPage() {
  const series = await getSeriesWithCounts()
  const posts = await getAllPosts()

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-8 md:mb-12 pt-20 md:pt-24">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 md:mb-4">
            Blog
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed">
            Artikelen over AI-gestuurde ontwikkeling en de reis van het bouwen van een EPD.
          </p>
        </div>

        {/* Series Section */}
        {series.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Series
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {series.map((serie) => (
                <SeriesCard key={serie.id} series={serie} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Posts Section */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Recente Posts
          </h2>
          {posts.length === 0 ? (
            <p className="text-slate-500 text-lg text-center py-12">
              Nog geen blogposts gepubliceerd.
            </p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={`${post.seriesId}-${post.slug}`}
                  href={`/blog/serie/${post.seriesId}/${post.slug}`}
                  className="block bg-white rounded-lg border border-slate-200 p-5 md:p-6 hover:border-teal-300 hover:shadow-md transition-all active:scale-[0.99]"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-500">
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {post.seriesId.replace('-', ' ')}
                    </span>
                    <span>•</span>
                    <time dateTime={post.frontmatter.date}>
                      {new Date(post.frontmatter.date).toLocaleDateString('nl-NL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    <span>•</span>
                    <span>{post.readingTime} min leestijd</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 leading-tight">
                    {post.frontmatter.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed line-clamp-2">
                    {post.frontmatter.description}
                  </p>
                  {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.frontmatter.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function SeriesCard({ series }: { series: BlogSeries & { postCount: number } }) {
  const colorStyles = {
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-200 hover:border-teal-400',
      badge: 'bg-teal-100 text-teal-700',
      dot: 'bg-teal-500',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200 hover:border-amber-400',
      badge: 'bg-amber-100 text-amber-700',
      dot: 'bg-amber-500',
    },
    slate: {
      bg: 'bg-slate-50',
      border: 'border-slate-200 hover:border-slate-400',
      badge: 'bg-slate-100 text-slate-700',
      dot: 'bg-slate-500',
    },
  }

  const styles = colorStyles[series.color] || colorStyles.slate
  const statusLabels = {
    completed: 'Voltooid',
    active: 'Actief',
    planned: 'Gepland',
  }

  return (
    <Link
      href={`/blog/serie/${series.id}`}
      className={`block rounded-lg border-2 p-5 transition-all hover:shadow-md active:scale-[0.98] ${styles.bg} ${styles.border}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
          {statusLabels[series.status]}
        </span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{series.title}</h3>
      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{series.description}</p>
      <div className="text-xs text-slate-500">
        {series.postCount} {series.postCount === 1 ? 'deel' : 'delen'}
      </div>
    </Link>
  )
}

