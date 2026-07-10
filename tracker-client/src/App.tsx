import { useEffect, useState } from 'react'

type SavedSearch = {
  id: string
  name: string
}

function App() {
  const [backendStatus, setBackendStatus] = useState<
    'connected' | 'unavailable' | null
  >(null)
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchName, setSearchName] = useState('')

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

  function openModal() {
    setSearchName('')
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setSearchName('')
  }

  function handleSaveSearch(event: React.FormEvent) {
    event.preventDefault()

    const trimmedName = searchName.trim()
    if (!trimmedName) return

    setSearches((current) => [
      ...current,
      { id: crypto.randomUUID(), name: trimmedName },
    ])
    closeModal()
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight">
            Marketplace Tracker
          </h1>
          <button
            type="button"
            onClick={openModal}
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

        {searches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-slate-500">No saved searches yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {searches.map((search) => (
              <li
                key={search.id}
                className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
              >
                <p className="font-medium text-slate-900">{search.name}</p>
              </li>
            ))}
          </ul>
        )}
      </main>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/50 px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-900">New Search</h2>
            <p className="mt-1 text-sm text-slate-500">
              Give your search a name so you can find it later.
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleSaveSearch}>
              <div>
                <label
                  htmlFor="search-name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Search name
                </label>
                <input
                  id="search-name"
                  type="text"
                  value={searchName}
                  onChange={(event) => setSearchName(event.target.value)}
                  placeholder="e.g. Vintage cameras under $100"
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!searchName.trim()}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
