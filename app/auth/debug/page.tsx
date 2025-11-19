'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function DebugContent() {
  const searchParams = useSearchParams()

  // Get all parameters
  const allParams: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    allParams[key] = value
  })

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">
            🔍 Auth Debug Page
          </h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">
              Full URL
            </h2>
            <div className="bg-slate-100 p-4 rounded-lg font-mono text-sm break-all">
              {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">
              URL Parameters ({Object.keys(allParams).length})
            </h2>
            {Object.keys(allParams).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(allParams).map(([key, value]) => (
                  <div key={key} className="bg-slate-100 p-4 rounded-lg">
                    <div className="font-mono text-sm">
                      <span className="text-teal-600 font-semibold">{key}</span>
                      <span className="text-slate-500"> = </span>
                      <span className="text-slate-900">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
                ⚠️ No URL parameters found
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">
              Expected Parameters for Password Reset
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${allParams.token_hash ? 'bg-green-500' : 'bg-red-500'}`} />
                <code className="text-slate-700">token_hash</code>
                <span className="text-slate-500">
                  {allParams.token_hash ? '✅ Present' : '❌ Missing'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${allParams.type === 'recovery' ? 'bg-green-500' : 'bg-amber-500'}`} />
                <code className="text-slate-700">type=recovery</code>
                <span className="text-slate-500">
                  {allParams.type === 'recovery' ? '✅ Correct' : allParams.type ? `⚠️ Wrong: ${allParams.type}` : '❌ Missing'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${allParams.next === '/update-password' ? 'bg-green-500' : 'bg-amber-500'}`} />
                <code className="text-slate-700">next=/update-password</code>
                <span className="text-slate-500">
                  {allParams.next === '/update-password' ? '✅ Correct' : allParams.next ? `⚠️ Wrong: ${allParams.next}` : '❌ Missing'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">
              Quick Actions
            </h2>
            <div className="flex gap-4">
              <a
                href="/login"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Go to Login
              </a>
              <a
                href="/reset-password"
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Reset Password
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DebugPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading debug info...</div>
      </div>
    }>
      <DebugContent />
    </Suspense>
  )
}
