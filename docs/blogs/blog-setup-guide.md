# Blog Setup Gids (ikbenlit.nl)

Deze gids beschrijft hoe de blog-sectie van `ikbenlit.nl` is opgezet, zodat je dit kunt kopiëren naar een ander Next.js project.

## 1. Architectuur Overzicht
De blog gebruikt een **Filesystem-based MDX** benadering:
- **Content**: Opgeslagen als `.mdx` bestanden in de folder `content/blog`.
- **Data Fetching**: Server-side functies lezen de bestanden en parsen de YAML frontmatter.
- **Rendering**: Gebruikt `next-mdx-remote` voor het renderen van MDX content met custom React componenten.
- **Styling**: Gebruikt Tailwind CSS met de `@tailwindcss/typography` plugin.

## 2. Dependencies
Installeer de volgende pakketten in je nieuwe project:

```bash
pnpm add next-mdx-remote gray-matter rehype-slug rehype-autolink-headings rehype-pretty-code remark-gfm
pnpm add -D @tailwindcss/typography @types/mdx
```

## 3. File Structure
Zorg voor de volgende directory structuur:

```text
.
├── app/
│   └── blog/
│       ├── page.tsx            # Blog overzichtspagina
│       └── [slug]/
│           └── page.tsx        # Individuele blogpost pagina
├── components/
│   └── blog/
│       ├── blog-list.tsx       # Lijst weergave component
│       └── ...                 # Overige UI componenten
├── content/
│   └── blog/
│       └── mijn-post.mdx       # Je blog artikelen
├── lib/
│   ├── blog.ts                 # Data fetching logica
│   ├── mdx-components.tsx      # MDX naar React mapping
│   └── types/
│       └── blog.ts             # TypeScript interfaces
└── tailwind.config.js          # Tailwind configuratie (typography)
```

## 4. Kern Implementatie

### A. Types (`lib/types/blog.ts`)
Definieer de structuur van een blogpost.

```typescript
export interface Post {
  slug: string
  title: string
  description: string
  date: string
  published: boolean
  image?: string
  tags?: string[]
  content: string
  url: string
  readingTime: number
}

export interface PostFrontmatter {
  title: string
  description: string
  date: string
  published?: boolean
  image?: string
  tags?: string[]
}
```

### B. Data Fetching (`lib/blog.ts`)
Deze functies lezen de bestanden van je harde schijf.

```typescript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Post, PostFrontmatter } from './types/blog'

const POSTS_DIRECTORY = path.join(process.cwd(), 'content/blog')

export async function getAllPosts(): Promise<Post[]> {
  const files = fs.readdirSync(POSTS_DIRECTORY).filter(f => f.endsWith('.mdx'))
  
  const posts = files.map((filename) => {
    const slug = filename.replace('.mdx', '')
    const fullPath = path.join(POSTS_DIRECTORY, filename)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    const frontmatter = data as PostFrontmatter

    return {
      slug,
      ...frontmatter,
      content,
      url: `/blog/${slug}`,
      readingTime: Math.ceil(content.split(/\s+/).length / 200),
    } as Post
  })

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(POSTS_DIRECTORY, `${slug}.mdx`)
  if (!fs.existsSync(fullPath)) return null
  
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const frontmatter = data as PostFrontmatter

  return {
    slug,
    ...frontmatter,
    content,
    url: `/blog/${slug}`,
    readingTime: Math.ceil(content.split(/\s+/).length / 200),
  }
}
```

### C. MDX Componenten (`lib/mdx-components.tsx`)
Map HTML elementen naar je eigen gestylede componenten.

```tsx
import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import Image from 'next/image'

export const mdxComponents: MDXComponents = {
  h1: (props) => <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />,
  h2: (props) => <h2 className="text-3xl font-bold mt-12 mb-4" {...props} />,
  p: (props) => <p className="leading-relaxed my-4" {...props} />,
  img: (props) => <Image width={800} height={400} className="rounded-lg my-8" {...props} alt={props.alt || ""} />,
  a: ({ href, ...props }) => <Link href={href || '#'} className="text-blue underline" {...props} />,
}
```

## 5. Pagina Implementatie

### Blog Overzicht (`app/blog/page.tsx`)
```tsx
import { getAllPosts } from '@/lib/blog'
import Link from 'next/link'

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <main className="container mx-auto py-12">
      <h1 className="text-5xl font-bold mb-12">Blog</h1>
      <div className="grid gap-8">
        {posts.map(post => (
          <Link key={post.slug} href={post.url} className="border p-6 rounded-lg hover:shadow-lg transition">
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <p className="text-gray-600">{post.description}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
```

### Blog Post Pagina (`app/blog/[slug]/page.tsx`)
```tsx
import { getPostBySlug, getAllPosts } from '@/lib/blog'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { mdxComponents } from '@/lib/mdx-components'
import { notFound } from 'next/navigation'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  return (
    <article className="container mx-auto py-12 max-w-4xl">
      <header className="mb-12">
        <h1 className="text-5xl font-bold">{post.title}</h1>
        <p className="text-xl text-gray-600 mt-4">{post.description}</p>
      </header>
      
      <div className="prose prose-lg max-w-none">
        <MDXRemote 
          source={post.content} 
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug],
            }
          }}
        />
      </div>
    </article>
  )
}
```

## 6. Tailwind Configuratie (`tailwind.config.js`)
Vergeet niet de typography plugin toe te voegen:

```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

## Tips voor Kopieren
1.  **MDX Styling**: De `prose` class in de pagina zorgt for de basis styling. Pas de `mdxComponents` aan voor specifieke elementen.
2.  **Afbeeldingen**: Zorg dat je een `public/images` folder hebt als je lokale afbeeldingen gebruikt in je MDX.
3.  **Frontmatter**: Elk `.mdx` bestand moet beginnen met:
    ```markdown
    ---
    title: Mijn Eerste Post
    description: Een korte samenvatting
    date: '2025-01-01'
    published: true
    ---
    ```
