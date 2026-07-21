import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchConnections } from '../api'
import { ProviderConnectionCard } from '../components/connections/ProviderConnectionCard'
import type { ProviderConnection } from '../types'

export function SettingsPage() {
  const [connections, setConnections] = useState<ProviderConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchConnections()
        if (!cancelled) setConnections(data)
      } catch {
        if (!cancelled) setError('Could not load connection settings.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  function handleUpdated(next: ProviderConnection) {
    setConnections((prev) =>
      prev.map((item) =>
        item.providerId === next.providerId ? next : item,
      ),
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/"
          className="text-sm text-stone-500 transition hover:text-stone-800"
        >
          ← Back to Scout
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-stone-900">
          Settings
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          Manage how Scout connects to marketplaces. Facebook Marketplace is
          available first; more providers can follow the same pattern later.
        </p>
      </div>

      <div>
        <h2 className="text-xs font-medium uppercase tracking-wide text-stone-400">
          Connected services
        </h2>

        <div className="mt-4 space-y-4">
          {loading && (
            <p className="text-sm text-stone-500">Loading connections…</p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading &&
            !error &&
            connections.map((connection) => (
              <ProviderConnectionCard
                key={connection.providerId}
                connection={connection}
                onUpdated={handleUpdated}
              />
            ))}

          {!loading && !error && connections.length === 0 && (
            <p className="text-sm text-stone-500">
              No marketplace connections are configured yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
