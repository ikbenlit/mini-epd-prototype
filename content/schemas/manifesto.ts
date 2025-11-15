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

