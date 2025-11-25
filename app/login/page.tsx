import { Brain, Zap, Target, Clock } from 'lucide-react'
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid'
import { LoginForm } from './components/login-form'

const bentoFeatures = [
  {
    name: 'AI Intake Samenvatting',
    description: 'Van 30 minuten handmatig werk naar 5 seconden automatisch. AI leest, begrijpt en structureert intake gesprekken.',
    icon: Brain,
    className: 'col-span-3 lg:col-span-2',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-teal-600/20" />
    ),
    href: '#',
    cta: 'Meer info'
  },
  {
    name: '90%+ Tijdsbesparing',
    description: 'Gemiddeld bespaar je 2+ uur per dag op documentatie',
    icon: Clock,
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/20" />
    ),
    href: '#',
    cta: 'Zie metrics'
  },
  {
    name: 'DSM Classificatie',
    description: 'Automatische categorisatie in 3 seconden vs 15 minuten handmatig',
    icon: Zap,
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20" />
    ),
    href: '#',
    cta: 'Ontdekken'
  },
  {
    name: 'SMART Behandelplannen',
    description: 'Gestructureerde doelen en interventies in 10 seconden. AI genereert evidence-based plannen.',
    icon: Target,
    className: 'col-span-3 lg:col-span-2',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20" />
    ),
    href: '#',
    cta: 'Bekijk voorbeeld'
  }
]

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-3/5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 lg:p-12 flex flex-col justify-center">
        <div className="max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <a href="/" className="inline-block mb-6 text-slate-300 hover:text-white transition-colors">
              ← Terug naar home
            </a>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              AI-Gestuurde EPD Workflows
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl">
              Van uren documentatie naar seconden. Ontdek hoe AI je dagelijkse workflow transformeert.
            </p>
          </div>

          <BentoGrid className="mb-8">
            {bentoFeatures.map((feature) => (
              <BentoCard
                key={feature.name}
                name={feature.name}
                description={feature.description}
                Icon={feature.icon}
                className={feature.className}
                background={feature.background}
                href={feature.href}
                cta={feature.cta}
              />
            ))}
          </BentoGrid>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl md:text-3xl font-bold text-amber-400">90%+</div>
              <div className="text-xs md:text-sm text-slate-400 mt-1">Tijdsbesparing</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl md:text-3xl font-bold text-amber-400">&lt; 5 sec</div>
              <div className="text-xs md:text-sm text-slate-400 mt-1">Gemiddelde respons</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl md:text-3xl font-bold text-slate-300">4 weken</div>
              <div className="text-xs md:text-sm text-slate-400 mt-1">Build tijd</div>
            </div>
          </div>
        </div>
      </div>

      <LoginForm />
    </div>
  )
}
