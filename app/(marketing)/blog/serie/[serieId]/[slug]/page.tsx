/**
 * Individual Blog Post Page
 *
 * Renders MDX content with series navigation
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getPost, getSeries, getPostsBySeries, getSeriesNavigation, getAllPosts } from '@/lib/mdx/blog'
import { mdxComponents } from '../../../../documentatie/components/mdx-components'

interface PostPageProps {
  params: Promise<{ serieId: string; slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    serieId: post.seriesId,
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: PostPageProps) {
  const { serieId, slug } = await params
  const post = await getPost(serieId, slug)
  const series = await getSeries(serieId)

  if (!post || !series) {
    return { title: 'Post niet gevonden' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aispeedrun.vercel.app'
  const postUrl = `${siteUrl}/blog/serie/${serieId}/${slug}`
  // Use post-specific image if provided, otherwise fall back to default
  const ogImageUrl = post.frontmatter.image
    ? `${siteUrl}${post.frontmatter.image.startsWith('/') ? '' : '/'}${post.frontmatter.image}`
    : `${siteUrl}/og-blog-default.png`

  return {
    title: `${post.frontmatter.title} - ${series.title}`,
    description: post.frontmatter.description,
    authors: [{ name: 'Colin van der Heijden', url: 'https://ikbenlit.nl' }],
    keywords: post.frontmatter.tags || [],
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: 'article',
      publishedTime: post.frontmatter.date,
      authors: ['Colin van der Heijden'],
      siteName: 'AI Speedrun',
      locale: 'nl_NL',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.frontmatter.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { serieId, slug } = await params
  const post = await getPost(serieId, slug)
  const series = await getSeries(serieId)

  if (!post || !series) {
    notFound()
  }

  const navigation = await getSeriesNavigation(serieId, slug)
  const { frontmatter, content, readingTime } = post

  // Generate Article structured data for SEO
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aispeedrun.vercel.app'
  const postUrl = `${siteUrl}/blog/serie/${serieId}/${slug}`
  // Use post-specific image if provided, otherwise fall back to default
  const articleImage = frontmatter.image
    ? `${siteUrl}${frontmatter.image.startsWith('/') ? '' : '/'}${frontmatter.image}`
    : `${siteUrl}/og-blog-default.png`
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description,
    image: articleImage,
    datePublished: frontmatter.date,
    dateModified: frontmatter.date,
    author: {
      '@type': 'Person',
      name: 'Colin van der Heijden',
      url: 'https://ikbenlit.nl',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Speedrun',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/aispeedrun-logo.webp`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    articleSection: series.title,
    keywords: frontmatter.tags?.join(', ') || '',
    wordCount: content.split(/\s+/).length,
    timeRequired: `PT${readingTime}M`,
  }

  // Generate BreadcrumbList structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
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
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: series.title,
        item: `${siteUrl}/blog/serie/${serieId}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: frontmatter.title,
        item: postUrl,
      },
    ],
  }

  const colorStyles = {
    teal: {
      badge: 'bg-teal-100 text-teal-700 border-teal-200',
      link: 'text-teal-600 hover:text-teal-700',
    },
    amber: {
      badge: 'bg-amber-100 text-amber-700 border-amber-200',
      link: 'text-amber-600 hover:text-amber-700',
    },
    slate: {
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      link: 'text-slate-600 hover:text-slate-700',
    },
  }

  const styles = colorStyles[series.color] || colorStyles.slate

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="max-w-3xl mx-auto px-4 md:px-8">
        {/* Back link */}
        <div className="pt-20 md:pt-24 mb-6">
          <Link
            href={`/blog/serie/${serieId}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Terug naar {series.title}</span>
          </Link>
        </div>

        {/* Header */}
        <header className="mb-8 pb-8 border-b border-slate-200">
          {/* Series badge */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Link
              href={`/blog/serie/${serieId}`}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors hover:opacity-80 ${styles.badge}`}
            >
              {series.title}
            </Link>
            <span className="text-sm text-slate-500">
              Deel {navigation.current} van {navigation.total}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            {frontmatter.title}
          </h1>

          {/* Description */}
          <p className="text-xl text-slate-600 leading-relaxed mb-4">
            {frontmatter.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <time dateTime={frontmatter.date}>
              {new Date(frontmatter.date).toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>•</span>
            <span>{readingTime} min leestijd</span>
          </div>

          {/* Tags */}
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* MDX Content */}
        <div className="prose prose-slate max-w-none">
          <MDXRemote source={content} components={mdxComponents} />
        </div>

        {/* Series Navigation */}
        <nav className="mt-12 pt-8 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
            {series.title} Serie
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Previous */}
            <div>
              {navigation.previous ? (
                <Link
                  href={`/blog/serie/${serieId}/${navigation.previous.slug}`}
                  className="block p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Vorige</span>
                  </div>
                  <div className="font-medium text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                    {navigation.previous.title}
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </div>

            {/* Next */}
            <div>
              {navigation.next ? (
                <Link
                  href={`/blog/serie/${serieId}/${navigation.next.slug}`}
                  className="block p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all group text-right"
                >
                  <div className="flex items-center justify-end gap-2 text-sm text-slate-500 mb-1">
                    <span>Volgende</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="font-medium text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                    {navigation.next.title}
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </nav>

        {/* Back to overview */}
        <footer className="mt-8 text-center">
          <Link
            href="/blog"
            className="text-sm text-slate-600 hover:text-teal-600 transition-colors"
          >
            ← Terug naar blog overzicht
          </Link>
        </footer>
      </article>
    </div>
  )
}

