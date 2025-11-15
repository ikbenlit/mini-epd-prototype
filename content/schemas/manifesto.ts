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

// EPD Demo Content Types
export interface EPDHero {
  title: string
  subtitle: string
  description: string
}

export interface DemoCredentials {
  email: string
  password: string
  note: string
}

export interface DemoSection {
  title: string
  description: string
  credentials: DemoCredentials
}

export interface FeatureItem {
  title: string
  description: string
  time: string
  traditional: string
}

export interface FeaturesSection {
  title: string
  items: FeatureItem[]
}

export interface ComparisonMetrics {
  label: string
  intake: string
  profile: string
  plan: string
  total: string
}

export interface ComparisonSection {
  title: string
  traditional: ComparisonMetrics
  speedrun: ComparisonMetrics
  savings: string
}

export interface VideoSection {
  title: string
  description: string
  placeholder: string
}

export interface EPDContent {
  hero: EPDHero
  demo: DemoSection
  features: FeaturesSection
  comparison: ComparisonSection
  video: VideoSection
  cta: CTAContent
}

// Contact Page Content Types
export interface ContactHero {
  title: string
  subtitle: string
  description: string
}

export interface FormField {
  label: string
  placeholder: string
  required: boolean
  error?: string
  options?: string[]
  minLength?: number
}

export interface FormFields {
  name: FormField
  email: FormField
  company: FormField
  projectType: FormField
  budget: FormField
  message: FormField
}

export interface FormButtons {
  submit: string
  submitting: string
}

export interface FormSuccess {
  title: string
  message: string
  cta: string
}

export interface FormError {
  title: string
  message: string
  retry: string
}

export interface FormSection {
  title: string
  fields: FormFields
  buttons: FormButtons
  success: FormSuccess
  error: FormError
}

export interface BenefitItem {
  title: string
  description: string
  icon: string
}

export interface BenefitsSection {
  title: string
  items: BenefitItem[]
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQSection {
  title: string
  items: FAQItem[]
}

export interface ContactContent {
  hero: ContactHero
  form: FormSection
  benefits: BenefitsSection
  faq: FAQSection
}

