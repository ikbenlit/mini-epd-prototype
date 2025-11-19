/**
 * Custom MDX Components
 *
 * Styled components for rendering MDX content
 */

import Image from 'next/image'
import Link from 'next/link'

type MDXComponents = {
  [key: string]: React.ComponentType<any>
}

export const mdxComponents: MDXComponents = {
  // Headings with anchor links
  h1: ({ children, ...props }) => (
    <h1 className="text-4xl font-bold text-slate-900 mt-8 mb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-3xl font-bold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-3" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-xl font-semibold text-slate-900 mt-4 mb-2" {...props}>
      {children}
    </h4>
  ),

  // Paragraphs
  p: ({ children, ...props }) => (
    <p className="text-slate-700 leading-relaxed mb-4" {...props}>
      {children}
    </p>
  ),

  // Lists
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside space-y-2 mb-4 text-slate-700" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-700" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="ml-4" {...props}>
      {children}
    </li>
  ),

  // Links
  a: ({ href, children, ...props }) => (
    <Link
      href={href || '#'}
      className="text-teal-600 hover:text-teal-700 underline underline-offset-2"
      {...props}
    >
      {children}
    </Link>
  ),

  // Images
  img: ({ src, alt, ...props }) => {
    if (!src) return null

    return (
      <figure className="my-8">
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <Image
            src={src}
            alt={alt || ''}
            width={1200}
            height={675}
            className="w-full h-auto"
            {...props}
          />
        </div>
        {alt && (
          <figcaption className="text-sm text-slate-500 italic mt-2 text-center">
            {alt}
          </figcaption>
        )}
      </figure>
    )
  },

  // Code blocks
  pre: ({ children, ...props }) => (
    <pre className="bg-slate-900 text-slate-50 rounded-lg p-4 overflow-x-auto mb-4 text-sm" {...props}>
      {children}
    </pre>
  ),
  code: ({ children, ...props }) => (
    <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  ),

  // Blockquote
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-4 border-teal-500 pl-4 py-2 my-4 bg-teal-50 text-slate-700 italic" {...props}>
      {children}
    </blockquote>
  ),

  // Horizontal rule
  hr: (props) => (
    <hr className="my-8 border-slate-200" {...props} />
  ),

  // Table
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-slate-200" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="px-4 py-3 bg-slate-50 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-200" {...props}>
      {children}
    </td>
  ),

  // Strong/Bold
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-slate-900" {...props}>
      {children}
    </strong>
  ),

  // Emphasis/Italic
  em: ({ children, ...props }) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
}
