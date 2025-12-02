/**
 * Release Detail Page
 *
 * Renders individual release note from MDX file
 */

import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getRelease, getAllReleases } from '@/lib/mdx/documentatie'
import { mdxComponents } from '../components/mdx-components'

interface ReleasePageProps {
  params: Promise<{
    category: string
  }>
}

// Generate static params for all releases
export async function generateStaticParams() {
  const releases = await getAllReleases()

  return releases.map((release) => ({
    category: release.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ReleasePageProps) {
  const { category } = await params
  const release = await getRelease(category)

  if (!release) {
    return {
      title: 'Release Not Found',
    }
  }

  return {
    title: `${release.frontmatter.title} - Documentatie`,
    description: release.frontmatter.description,
  }
}

function ArticleJsonLd({
  title,
  description,
  releaseDate,
  slug,
}: {
  title: string
  description: string
  releaseDate: string
  slug: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aispeedrun.vercel.app'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${siteUrl}/documentatie/${slug}#article`,
        headline: title,
        description: description,
        datePublished: releaseDate,
        dateModified: releaseDate,
        author: {
          '@type': 'Person',
          name: 'Colin van der Heijden',
          url: 'https://ikbenlit.nl',
        },
        publisher: { '@id': `${siteUrl}/#organization` },
        mainEntityOfPage: `${siteUrl}/documentatie/${slug}`,
        inLanguage: 'nl-NL',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${siteUrl}/documentatie/${slug}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Documentatie',
            item: `${siteUrl}/documentatie`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: title,
          },
        ],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default async function ReleasePage({ params }: ReleasePageProps) {
  const { category } = await params
  const release = await getRelease(category)

  if (!release) {
    notFound()
  }

  const { frontmatter, content } = release

  return (
    <div className="min-h-screen bg-white pb-16">
      <ArticleJsonLd
        title={frontmatter.title}
        description={frontmatter.description}
        releaseDate={frontmatter.releaseDate}
        slug={category}
      />
      <article className="max-w-4xl mx-auto px-4 md:px-8 pt-20 md:pt-20">
        {/* Header */}
        <header className="mb-8 pb-8 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <StatusBadge status={frontmatter.status} />
            <span className="text-sm text-slate-500">v{frontmatter.version}</span>
            <span className="text-sm text-slate-500">•</span>
            <time className="text-sm text-slate-500">
              {new Date(frontmatter.releaseDate).toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            {frontmatter.title}
          </h1>

          <p className="text-xl text-slate-600">
            {frontmatter.description}
          </p>
        </header>

        {/* MDX Content */}
        <div className="prose prose-slate max-w-none">
          <MDXRemote source={content} components={mdxComponents} />
        </div>

        {/* Footer Navigation */}
        <footer className="mt-12 pt-8 border-slate-200">
          <div className="flex justify-between items-center">
            <a
              href="/documentatie"
              className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Terug naar overzicht
            </a>

            <a
              href="/#timeline"
              className="text-slate-600 hover:text-slate-700 font-medium"
            >
              Bekijk timeline →
            </a>
          </div>
        </footer>
      </article>
    </div>
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
