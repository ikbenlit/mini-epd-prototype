/**
 * Insight Box Component
 * 
 * Visual anchor for key takeaways with yellow left border.
 * Used to highlight important insights in the manifesto content.
 */

interface InsightBoxProps {
  children: React.ReactNode
  variant?: 'default' | 'highlight'
}

export function InsightBox({ children, variant = 'default' }: InsightBoxProps) {
  const borderColor = variant === 'highlight' ? '#D97706' : '#F59E0B'
  
  return (
    <div
      className="bg-white shadow-sm my-6 md:my-8 p-6 border-t-4 md:border-t-0 md:border-l-4"
      style={{
        borderLeftColor: borderColor,
        borderTopColor: borderColor,
        borderLeftWidth: '3px',
        borderTopWidth: '3px',
      }}
    >
      <p className="text-base md:text-lg font-serif text-slate-900 leading-relaxed">
        {children}
      </p>
    </div>
  )
}

