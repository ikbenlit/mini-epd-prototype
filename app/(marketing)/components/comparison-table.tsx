/**
 * Comparison Table Component
 * 
 * Visual comparison between Traditional and AI Speedrun approaches.
 * Responsive: table on desktop, stacked cards on mobile.
 */

import type { ComparisonContent } from '@/content/schemas/manifesto'

interface ComparisonTableProps {
  content: ComparisonContent
}

export function ComparisonTable({ content }: ComparisonTableProps) {
  return (
    <section className="my-8 md:my-12" aria-labelledby="comparison-heading">
      <h2 
        id="comparison-heading"
        className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 md:mb-6 text-center font-sans"
      >
        {content.heading}
      </h2>
      
      {/* Desktop: Table view */}
      <div 
        className="hidden md:block overflow-hidden rounded-lg border"
        style={{ borderColor: '#E2E8F0' }}
      >
        <table className="w-full" role="table" aria-labelledby="comparison-heading">
          <thead>
            <tr 
              className="bg-slate-50 border-b"
              style={{ borderColor: '#E2E8F0' }}
            >
              <th scope="col" className="px-6 py-4 text-left font-semibold text-slate-900 font-sans">
                Aspect
              </th>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-slate-900 font-sans">
                Traditioneel
              </th>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-slate-900 font-sans">
                AI Speedrun
              </th>
            </tr>
          </thead>
          <tbody>
            {content.items.map((item, index) => (
              <tr
                key={item.label}
                className={`border-b ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                }`}
                style={{ borderColor: '#E2E8F0' }}
              >
                <th scope="row" className="px-6 py-4 font-medium text-slate-900 font-sans">
                  {item.label}
                </th>
                <td className="px-6 py-4 text-slate-700 font-serif">
                  {item.traditional}
                </td>
                <td className="px-6 py-4 text-slate-900 font-semibold font-serif">
                  {item.aiSpeedrun}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Stacked cards */}
      <div className="md:hidden space-y-4" role="list" aria-label="Vergelijking items">
        {content.items.map((item) => (
          <div
            key={item.label}
            className="bg-white border rounded-lg p-4 shadow-sm"
            style={{ borderColor: '#E2E8F0' }}
            role="listitem"
          >
            <h3 className="font-semibold text-slate-900 mb-3 font-sans">
              {item.label}
            </h3>
            <dl className="space-y-2">
              <div className="flex justify-between items-start">
                <dt className="text-sm text-slate-600 font-sans">Traditioneel:</dt>
                <dd className="text-sm text-slate-700 font-serif text-right ml-4">
                  {item.traditional}
                </dd>
              </div>
              <div className="flex justify-between items-start">
                <dt className="text-sm font-semibold text-slate-900 font-sans">
                  AI Speedrun:
                </dt>
                <dd className="text-sm font-semibold text-slate-900 font-serif text-right ml-4">
                  {item.aiSpeedrun}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  )
}

