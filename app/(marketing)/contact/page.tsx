/**
 * Contact Page
 *
 * Lead capture form with benefits and FAQ
 */

import type { Metadata } from 'next'
import { getContent } from '@/lib/content/loader'
import type { ContactContent } from '@/content/schemas/manifesto'
import { Clock, Euro, Code, Eye, ChevronDown } from 'lucide-react'
import { ContactForm } from './contact-form'

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aispeedrun.vercel.app'

  return {
    title: 'Contact - AI Speedrun',
    description: 'Van idee naar werkend prototype in 4 weken voor €200. Start je speedrun vandaag.',
    openGraph: {
      type: 'website',
      title: 'Contact - AI Speedrun',
      description: 'Van idee naar werkend prototype in 4 weken voor €200',
      images: [`${siteUrl}/og-image.png`],
      siteName: 'AI Speedrun',
      locale: 'nl_NL',
    },
    alternates: {
      canonical: `${siteUrl}/contact`,
    },
  }
}

export default async function ContactPage() {
  const content = await getContent<ContactContent>('nl', 'contact')

  const iconMap = {
    clock: Clock,
    euro: Euro,
    code: Code,
    eye: Eye,
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4 pt-32 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            {content.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-green-600 font-medium mb-4">
            {content.hero.subtitle}
          </p>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {content.hero.description}
          </p>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Left Column - Form */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              {content.form.title}
            </h2>
            <ContactForm content={content.form} />
          </div>

          {/* Right Column - Benefits & FAQ */}
          <div className="space-y-12">
            {/* Benefits */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                {content.benefits.title}
              </h3>
              <div className="space-y-4">
                {content.benefits.items.map((benefit, index) => {
                  const Icon = iconMap[benefit.icon as keyof typeof iconMap] || Clock
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-slate-600 text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                {content.faq.title}
              </h3>
              <div className="space-y-4">
                {content.faq.items.map((item, index) => (
                  <details
                    key={index}
                    className="group bg-slate-50 rounded-lg border border-slate-200 overflow-hidden"
                  >
                    <summary className="flex justify-between items-center cursor-pointer px-6 py-4 hover:bg-slate-100 transition-colors">
                      <span className="font-medium text-slate-900">
                        {item.question}
                      </span>
                      <ChevronDown className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-6 py-4 border-t border-slate-200 text-slate-600">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Additional CTA */}
            <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-lg p-6 text-center">
              <p className="text-slate-700 mb-4">
                <strong>Nog vragen?</strong> Stuur een email naar{' '}
                <a
                  href="mailto:contact@speedrun.nl"
                  className="text-green-600 hover:text-green-700 underline"
                >
                  contact@speedrun.nl
                </a>
              </p>
              <p className="text-sm text-slate-600">
                We reageren binnen 24 uur
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
