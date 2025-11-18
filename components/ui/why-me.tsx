'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import aboutContent from '@/content/nl/about.json'

export function WhyMe() {
  const [mounted, setMounted] = useState(false)
  const { title, subtitle, image, paragraphs, stats, expertise } = aboutContent

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section
      id="over"
      className="section-padding bg-gray-50 relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-6xl mx-auto">
          {/* Left: Text Content */}
          <ScrollReveal direction="left">
            <div className="space-y-8">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-text-primary leading-tight">
                {title}
              </h2>

              <p className="text-xl md:text-2xl text-text-secondary font-light leading-relaxed">
                {subtitle}
              </p>

              <div className="space-y-6 text-text-secondary text-lg leading-relaxed">
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-heading font-bold text-text-primary mb-1">{stat.value}</div>
                    <div className="text-text-secondary text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Photo */}
          <ScrollReveal direction="right" delay={200}>
            <div className="relative aspect-[3/4] lg:aspect-[4/5] max-w-md mx-auto lg:ml-auto">
              {/* Optional subtle border/frame effect */}
              <div className="absolute inset-0 rounded-2xl bg-teal/10" />

              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* FASE 2: Expertise Section - Full Width with Floating Animation */}
        {expertise && (
          <div className="mt-16 pt-16 border-t border-gray-200">
            <ScrollReveal>
              <h3 className="text-2xl md:text-3xl font-heading font-bold text-center mb-3 text-text-primary">
                {expertise.label}
              </h3>
              <p className="text-center text-text-secondary mb-12 max-w-2xl mx-auto">
                De tools en methoden waarmee ik jouw AI-uitdaging aanpak
              </p>
            </ScrollReveal>

            <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
              {expertise.items.map((item, index) => (
                <div
                  key={index}
                  className={`
                    group px-5 py-3 rounded-full font-medium text-sm
                    transition-all duration-300 cursor-default animate-float
                    border shadow-sm
                    ${
                      item.highlight
                        ? 'bg-teal-700 text-white border-teal-700 hover:bg-teal-600 hover:-translate-y-2 hover:rotate-2 hover:shadow-md'
                        : 'bg-white text-gray-800 border-gray-300 hover:bg-teal-50 hover:border-teal-600 hover:text-teal-800 hover:-translate-y-2 hover:rotate-1 hover:shadow-md'
                    }
                  `}
                  style={{
                    animationDelay: mounted ? `${index * 150}ms` : '0ms',
                    animationDuration: `${5 + (index % 3) * 0.8}s`,
                  }}
                >
                  <span className="font-semibold">{item.name}</span>
                  <span className={`ml-2 text-xs ${item.highlight ? 'opacity-80 group-hover:opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
