/**
 * EPD Demo Page
 *
 * Showcases the EPD prototype with demo credentials,
 * feature highlights, and comparison metrics.
 */

import type { Metadata } from 'next'
import { getContent } from '@/lib/content/loader'
import type { EPDContent, MetadataContent } from '@/content/schemas/manifesto'
import { Clock, Zap, FileText, Brain } from 'lucide-react'
import { CredentialsBox } from './credentials-box'

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const metadataContent = await getContent<MetadataContent>('nl', 'metadata')
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aispeedrun.vercel.app'

  return {
    title: 'EPD Prototype - AI Speedrun',
    description: 'Ervaar hoe AI de workflow van GGZ-professionals transformeert. Van intake tot behandelplan in seconden.',
    openGraph: {
      type: 'website',
      title: 'EPD Prototype - AI Speedrun',
      description: 'Van 30 minuten documentatie naar 3 minuten. Probeer het prototype.',
      images: [`${siteUrl}/og-image.png`],
      siteName: 'AI Speedrun',
      locale: 'nl_NL',
    },
    alternates: {
      canonical: `${siteUrl}/epd`,
    },
  }
}

export default async function EPDPage() {
  const content = await getContent<EPDContent>('nl', 'epd')

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-white px-4 pt-32 pb-16">
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

      {/* Demo Credentials Section */}
      <section id="demo-login" className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            {content.demo.title}
          </h2>
          <p className="text-slate-600 mb-8">
            {content.demo.description}
          </p>

          <CredentialsBox credentials={content.demo.credentials} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            {content.features.title}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {content.features.items.map((feature, index) => {
              const icons = [Brain, Zap, FileText, Clock]
              const Icon = icons[index % icons.length]

              return (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 mb-4">
                        {feature.description}
                      </p>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-green-600">
                            Met AI:
                          </span>
                          <span className="text-slate-900 font-semibold">
                            {feature.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-500">
                            Traditioneel:
                          </span>
                          <span className="text-slate-600 line-through">
                            {feature.traditional}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            {content.comparison.title}
          </h2>

          <div className="bg-slate-50 rounded-lg p-6 md:p-8 border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left pb-4 pr-4 font-semibold text-slate-700">
                      Stap
                    </th>
                    <th className="text-right pb-4 px-4 font-semibold text-slate-700">
                      {content.comparison.traditional.label}
                    </th>
                    <th className="text-right pb-4 pl-4 font-semibold text-green-700">
                      {content.comparison.speedrun.label}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-3 pr-4 text-slate-900">Intake samenvatting</td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {content.comparison.traditional.intake}
                    </td>
                    <td className="py-3 pl-4 text-right font-semibold text-green-600">
                      {content.comparison.speedrun.intake}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-slate-900">Probleemprofiel</td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {content.comparison.traditional.profile}
                    </td>
                    <td className="py-3 pl-4 text-right font-semibold text-green-600">
                      {content.comparison.speedrun.profile}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-slate-900">Behandelplan</td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {content.comparison.traditional.plan}
                    </td>
                    <td className="py-3 pl-4 text-right font-semibold text-green-600">
                      {content.comparison.speedrun.plan}
                    </td>
                  </tr>
                  <tr className="font-bold border-t-2 border-slate-300">
                    <td className="pt-4 pr-4 text-slate-900">Totaal</td>
                    <td className="pt-4 px-4 text-right text-slate-700">
                      {content.comparison.traditional.total}
                    </td>
                    <td className="pt-4 pl-4 text-right text-green-700">
                      {content.comparison.speedrun.total}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-center">
              <p className="text-2xl font-bold text-green-600">
                {content.comparison.savings}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            {content.video.title}
          </h2>
          <p className="text-slate-600 mb-8">
            {content.video.description}
          </p>

          <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center border border-slate-300">
            <p className="text-slate-500 font-medium">
              {content.video.placeholder}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {content.cta.heading}
          </h2>
          {content.cta.subheading && (
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              {content.cta.subheading}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={content.cta.primaryButton.href}
              className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              {content.cta.primaryButton.text}
            </a>
            <a
              href={content.cta.secondaryButton.href}
              className="inline-block px-8 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border-2 border-slate-300 transition-colors"
            >
              {content.cta.secondaryButton.text}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
