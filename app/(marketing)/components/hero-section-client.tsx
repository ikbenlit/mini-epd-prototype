'use client'

import { HeroSection } from '@/components/ui/hero-section-2'

interface HeroSectionClientProps {
  logo?: {
    url: string
    alt: string
    text?: string
  }
  slogan?: string
  title: React.ReactNode
  subtitle: string | React.ReactNode
  punchline?: string | React.ReactNode
  callToAction: {
    text: string
    href: string
  }
  secondaryCallToAction?: {
    text: string
    href: string
  }
  backgroundImage: string
  contactInfo?: {
    website: string
    phone: string
    address: string
  }
}

export function HeroSectionClient(props: HeroSectionClientProps) {
  return <HeroSection {...props} />
}
