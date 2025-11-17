import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 met speedrun styling */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-teal-600 mb-2">404</h1>
          <div className="h-1 w-32 bg-teal-600 mx-auto mb-6"></div>
        </div>

        {/* Speedrun-themed message */}
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Je bent iets te snel voor onze speedrun
        </h2>

        <p className="text-xl text-slate-600 mb-8 max-w-xl mx-auto">
          Deze feature is nog niet gebouwd. Blijkbaar heb je een snellere route gevonden dan wij verwacht hadden.
          Respect voor de optimalisatie! 🏃‍♂️
        </p>

        {/* Stats box - speedrun style */}
        <div className="bg-slate-900 text-white rounded-lg p-6 mb-8 max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400">Status:</span>
            <span className="text-teal-400 font-mono">NOT_FOUND</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400">Build Progress:</span>
            <span className="text-yellow-400 font-mono">IN_PROGRESS</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">ETA:</span>
            <span className="text-teal-400 font-mono">SOON™</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
          >
            ← Terug naar de start
          </Link>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border-2 border-slate-300 transition-colors"
          >
            Probeer het prototype
          </Link>
        </div>

        {/* Easter egg */}
        <p className="text-sm text-slate-400 mt-12">
          <span className="font-mono">Tip:</span> Probeer de bekende routes in de timeline. Die werken wél.
        </p>
      </div>
    </div>
  )
}
