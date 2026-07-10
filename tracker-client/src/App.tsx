import { useEffect, useState } from 'react'

function App() {
  const [backendStatus, setBackendStatus] = useState<
    'connected' | 'unavailable' | null
  >(null)

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch('http://localhost:3000/health')
        const data = await response.json()

        if (data.status === 'ok') {
          setBackendStatus('connected')
        } else {
          setBackendStatus('unavailable')
        }
      } catch {
        setBackendStatus('unavailable')
      }
    }

    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight">
            Marketplace Tracker
          </h1>
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            New Search
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {backendStatus && (
          <p
            className={`mb-6 text-sm font-medium ${
              backendStatus === 'connected'
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {backendStatus === 'connected'
              ? 'Backend connected'
              : 'Backend unavailable'}
          </p>
        )}

        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-slate-500">No saved searches yet.</p>
        </div>
      </main>
    </div>
  )
}

export default App
