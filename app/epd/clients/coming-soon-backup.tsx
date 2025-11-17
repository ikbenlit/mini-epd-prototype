import { CheckCircle2, Circle, Clock, Rocket } from "lucide-react"

export default function ComingSoonPage() {
  // Roadmap items from bouwplan v2.1
  const roadmapItems = [
    {
      week: "Week 1",
      status: "in-progress",
      title: "Foundation & Marketing",
      items: [
        { done: true, text: "Project Setup - Next.js + Supabase" },
        { done: true, text: "Design System - Teal-first kleuren" },
        { done: true, text: "App Layout - Header + Sidebar" },
        { done: false, text: "Marketing Website - Timeline + Features" },
      ],
    },
    {
      week: "Week 2",
      status: "upcoming",
      title: "EPD Core",
      items: [
        { done: false, text: "Database Schema + RLS Policies" },
        { done: false, text: "Client Module - CRUD Operations" },
        { done: false, text: "Client Detail Page" },
      ],
    },
    {
      week: "Week 3",
      status: "upcoming",
      title: "AI Magic",
      items: [
        { done: false, text: "TipTap Rich Text Editor" },
        { done: false, text: "Claude API - Intake Samenvatting" },
        { done: false, text: "AI Profiel + Behandelplan Generator" },
      ],
    },
    {
      week: "Week 4",
      status: "upcoming",
      title: "Polish & Launch",
      items: [
        { done: false, text: "Onboarding System" },
        { done: false, text: "Performance Optimization" },
        { done: false, text: "Demo Preparation + LinkedIn Launch" },
      ],
    },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 mb-6 shadow-lg">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Coming Soon
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-2">
            Het EPD wordt gebouwd in <span className="font-semibold text-teal-700">4 weken</span>
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Van €100.000+ en 12-24 maanden → <span className="font-mono font-semibold text-amber-700">€200 + 4 weken</span>
          </p>

          {/* Build in Public Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-full">
            <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-sm font-medium text-teal-800">
              Building in Public
            </span>
          </div>
        </div>

        {/* Roadmap */}
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              4-Weken Roadmap
            </h2>
            <p className="text-slate-600">
              Volg de voortgang van dit experiment
            </p>
          </div>

          {roadmapItems.map((week, idx) => (
            <div
              key={week.week}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Week Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center font-mono text-sm font-semibold ${
                      week.status === "in-progress"
                        ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white"
                        : week.status === "upcoming"
                        ? "bg-slate-100 text-slate-400"
                        : "bg-gradient-to-br from-teal-600 to-teal-700 text-white"
                    }`}
                  >
                    W{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {week.week}
                    </h3>
                    <p className="text-sm text-slate-600">{week.title}</p>
                  </div>
                </div>
                <StatusBadge status={week.status} />
              </div>

              {/* Items Checklist */}
              <ul className="space-y-2">
                {week.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3">
                    {item.done ? (
                      <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-sm ${
                        item.done
                          ? "text-slate-700 line-through"
                          : "text-slate-600"
                      }`}
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">
            Volg de build op LinkedIn voor real-time updates
          </p>
          <a
            href="https://linkedin.com/in/colinlit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <span>Volg op LinkedIn</span>
            <span>→</span>
          </a>
        </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    "in-progress": {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
      label: "In Progress",
      icon: Clock,
    },
    upcoming: {
      bg: "bg-slate-50 border-slate-200",
      text: "text-slate-600",
      label: "Upcoming",
      icon: Circle,
    },
    completed: {
      bg: "bg-teal-50 border-teal-200",
      text: "text-teal-700",
      label: "Completed",
      icon: CheckCircle2,
    },
  }

  const { bg, text, label, icon: Icon } = config[status as keyof typeof config]

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${bg} ${text}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  )
}
