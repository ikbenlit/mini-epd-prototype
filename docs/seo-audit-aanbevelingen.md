# SEO Audit & Aanbevelingen - AI Speedrun

**Datum:** 2025-01-27  
**Auditor:** SEO Specialist  
**Website:** aispeedrun.vercel.app

## Executive Summary

De website heeft een solide basis voor SEO met goede metadata, sitemap en robots.txt. Er zijn echter belangrijke verbeteringen mogelijk op het gebied van structured data, Open Graph images, en content optimalisatie.

---

## ✅ Wat Goed Is

1. **Basis Metadata**: Goede title templates en descriptions in root layout
2. **Robots.txt**: Correct geconfigureerd met sitemap referentie
3. **Sitemap**: Dynamisch gegenereerd met documentatie releases
4. **Structured Data**: Basis Organization en WebSite schema aanwezig
5. **Open Graph**: Basis OG tags aanwezig op homepage
6. **Canonical URLs**: Aanwezig op homepage
7. **Alt Tags**: Aanwezig op meeste images
8. **Semantic HTML**: Goed gebruik van article, header, nav tags

---

## 🔴 Kritieke Verbeteringen (Hoge Prioriteit)

### 1. Blog Posts Ontbreken in Sitemap
**Probleem:** Blog posts worden niet toegevoegd aan de sitemap, waardoor ze mogelijk niet geïndexeerd worden.

**Impact:** Hoog - Blog content is belangrijk voor SEO

**Oplossing:** Update `app/sitemap.ts` om alle blog posts toe te voegen

### 2. Blog Posts Missen Open Graph Images
**Probleem:** Blog posts hebben geen OG images, wat de social sharing vermindert.

**Impact:** Hoog - Slechte social previews = minder clicks

**Oplossing:** Voeg OG image support toe aan blog post metadata

### 3. Blog Posts Missen Canonical URLs
**Probleem:** Geen canonical URLs op individuele blog posts.

**Impact:** Medium - Kan duplicate content issues veroorzaken

**Oplossing:** Voeg canonical URL toe aan blog post metadata

### 4. Blog Posts Missen Article Structured Data
**Probleem:** Geen Article schema.org markup op blog posts.

**Probleem:** Hoog - Gemiste kans voor rich snippets in Google

**Oplossing:** Voeg Article schema toe aan blog post pages

### 5. Blog Posts Missen Author Metadata
**Probleem:** Geen author informatie in blog post metadata.

**Impact:** Medium - Minder context voor zoekmachines

**Oplossing:** Voeg author metadata toe aan blog posts

---

## 🟡 Belangrijke Verbeteringen (Medium Prioriteit)

### 6. Breadcrumbs Structured Data
**Probleem:** Geen breadcrumb navigation met structured data.

**Impact:** Medium - Kan rich snippets opleveren in Google

**Oplossing:** Implementeer breadcrumb component met BreadcrumbList schema

### 7. Blog Series Metadata
**Probleem:** Blog series pagina's missen uitgebreide metadata.

**Impact:** Medium - Series pagina's kunnen beter ranken

**Oplossing:** Voeg uitgebreide metadata toe aan series pages

### 8. Documentatie Metadata
**Probleem:** Documentatie pagina's missen mogelijk specifieke metadata.

**Impact:** Medium - Documentatie is waardevolle content

**Oplossing:** Controleer en verbeter documentatie metadata

### 9. Image Optimization
**Probleem:** Mogelijk niet alle images hebben alt tags of zijn geoptimaliseerd.

**Impact:** Medium - Images zijn belangrijk voor SEO

**Oplossing:** Audit alle images en voeg alt tags toe waar nodig

### 10. Internal Linking
**Probleem:** Mogelijk onvoldoende interne links tussen gerelateerde content.

**Impact:** Medium - Helpt met crawlability en ranking

**Oplossing:** Voeg gerelateerde posts/artikelen secties toe

---

## 🟢 Nice-to-Have Verbeteringen (Lage Prioriteit)

### 11. FAQ Structured Data
**Probleem:** Geen FAQ schema waar relevant (bijv. op homepage of contact pagina).

**Impact:** Laag - Kan rich snippets opleveren

**Oplossing:** Voeg FAQ schema toe waar relevant

### 12. Review/Rating Schema
**Probleem:** Geen review schema voor testimonials (als die er zijn).

**Impact:** Laag - Kan rich snippets opleveren

**Oplossing:** Voeg Review schema toe indien relevant

### 13. Video Schema
**Probleem:** Als er video content is, ontbreekt VideoObject schema.

**Impact:** Laag - Alleen relevant als er video's zijn

**Oplossing:** Voeg VideoObject schema toe indien van toepassing

### 14. Performance Metrics
**Probleem:** Geen specifieke performance optimalisaties voor Core Web Vitals.

**Impact:** Laag - Performance is ranking factor

**Oplossing:** Monitor en optimaliseer Core Web Vitals

### 15. hreflang Tags
**Probleem:** Geen hreflang tags (maar waarschijnlijk niet nodig als alleen NL).

**Impact:** Laag - Alleen nodig bij meertaligheid

**Oplossing:** Voeg toe als je meerdere talen toevoegt

---

## 📋 Implementatie Prioriteiten

### Fase 1 (Direct - Deze Week)
1. ✅ Blog posts toevoegen aan sitemap
2. ✅ Open Graph images voor blog posts
3. ✅ Canonical URLs voor blog posts
4. ✅ Article structured data voor blog posts
5. ✅ Author metadata voor blog posts

### Fase 2 (Binnen 2 Weken)
6. ✅ Breadcrumbs structured data
7. ✅ Blog series metadata verbeteren
8. ✅ Image alt tags audit
9. ✅ Internal linking verbeteren

### Fase 3 (Binnen Maand)
10. ✅ FAQ schema waar relevant
11. ✅ Performance optimalisaties
12. ✅ Content optimalisatie (keywords, headings)

---

## 🔍 Technische Details per Verbetering

### 1. Blog Posts in Sitemap
```typescript
// app/sitemap.ts
import { getAllPosts } from '@/lib/mdx/blog'

// In sitemap functie:
const posts = await getAllPosts()
const postUrls = posts.map((post) => ({
  url: `${baseUrl}/blog/serie/${post.seriesId}/${post.slug}`,
  lastModified: new Date(post.frontmatter.date),
  changeFrequency: 'monthly' as const,
  priority: 0.7,
}))
```

### 2. Open Graph Images voor Blog Posts
```typescript
// app/(marketing)/blog/serie/[serieId]/[slug]/page.tsx
// In generateMetadata:
openGraph: {
  images: [
    {
      url: post.frontmatter.image || `${siteUrl}/og-blog-default.png`,
      width: 1200,
      height: 630,
      alt: post.frontmatter.title,
    },
  ],
}
```

### 3. Article Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Post Title",
  "author": {
    "@type": "Person",
    "name": "Colin van der Heijden"
  },
  "datePublished": "2024-11-19",
  "publisher": {
    "@type": "Organization",
    "name": "AI Speedrun"
  }
}
```

### 4. Breadcrumbs
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://aispeedrun.vercel.app"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://aispeedrun.vercel.app/blog"
    }
  ]
}
```

---

## 📊 Monitoring & Validatie

Na implementatie, valideer met:
- Google Search Console
- Google Rich Results Test
- Facebook Sharing Debugger
- Twitter Card Validator
- Schema.org Validator

---

## 📝 Notities

- Website is primair in het Nederlands - hreflang niet nodig tenzij meertaligheid wordt toegevoegd
- Blog content is sterk - focus op technische SEO om dit te ondersteunen
- Build-in-public aanpak is uniek - kan gebruikt worden voor content marketing SEO

