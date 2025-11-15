export interface HeroContent {
  quote: string
  attribution: string
  attributionContext?: string
  subtitle: string
}

export type SectionType = 'paragraph' | 'insight' | 'statement'

export interface ParagraphSection {
  id: string
  type: 'paragraph'
  content: string
}

export interface InsightSection {
  id: string
  type: 'insight'
  content: string
}

export interface StatementSection {
  id: string
  type: 'statement'
  variant?: 'dark' | 'light'
  heading: string
  content: string
}

export type ManifestoSection = 
  | ParagraphSection 
  | InsightSection 
  | StatementSection

export interface ComparisonItem {
  label: string
  traditional: string
  aiSpeedrun: string
}

export interface ComparisonContent {
  heading: string
  items: ComparisonItem[]
}

export interface CTAButton {
  text: string
  href: string
}

export interface CTAContent {
  heading: string
  subheading?: string
  primaryButton: CTAButton
  secondaryButton: CTAButton
}

export interface ManifestoContent {
  hero: HeroContent
  sections: ManifestoSection[]
  comparison: ComparisonContent
  cta: CTAContent
}

// Navigation Content Types
export interface NavigationLink {
  label: string
  href: string
}

export interface NavigationContent {
  logo: string
  links: NavigationLink[]
}

// Metadata Content Types
export interface ManifestoMetadata {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  keywords: string[]
}

export interface MetadataContent {
  manifesto: ManifestoMetadata
}

// Common Content Types
export interface CommonButtons {
  readMore: string
  scrollDown: string
  followProgress: string
  viewDemo: string
  contact: string
}

export interface CommonLabels {
  readingTime: string
  lastUpdated: string
  share: string
}

export interface CommonContent {
  buttons: CommonButtons
  labels: CommonLabels
}

