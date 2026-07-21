import { useEffect, useMemo, useState } from 'react'
import { fetchConnections } from '../api'
import { ProviderStatusList } from '../components/ProviderStatusList'
import { RecentActivity } from '../components/RecentActivity'
import { RecentListings } from '../components/RecentListings'
import { WatchingList } from '../components/WatchingList'
import { WatchSearch } from '../components/WatchSearch'
import { useAppData } from '../context/AppDataContext'
import { useAttentionCounts } from '../lib/listings'
import { formatRelativeTime, getLatestCheckedAt } from '../lib/format'
import { recordVisit } from '../lib/storage'
import type { ConnectionStatus } from '../types'

export function DashboardPage() {
  const { searches, listings, isLoading, runningId, statusVersion } = useAppData()
  const { perSearch } = useAttentionCounts(searches, listings, statusVersion)
  const [facebookStatus, setFacebookStatus] = useState<ConnectionStatus | null>(
    null,
  )
  const [providersLoading, setProvidersLoading] = useState(true)

  useEffect(() => {
    return () => {
      recordVisit()
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadProviders() {
      setProvidersLoading(true)
      try {
        const connections = await fetchConnections()
        const facebook = connections.find((c) => c.providerId === 'facebook')
        if (!cancelled) {
          setFacebookStatus(facebook?.status ?? 'not_connected')
        }
      } catch {
        if (!cancelled) setFacebookStatus(null)
      } finally {
        if (!cancelled) setProvidersLoading(false)
      }
    }

    void loadProviders()
    return () => {
      cancelled = true
    }
  }, [])

  const sortedSearches = useMemo(() => {
    return [...perSearch].sort((a, b) => {
      if (a.count > 0 && b.count === 0) return -1
      if (a.count === 0 && b.count > 0) return 1
      return a.search.name.localeCompare(b.search.name)
    })
  }, [perSearch])

  const lastCheckedAt = useMemo(
    () => getLatestCheckedAt(searches),
    [searches],
  )

  const isFirstVisit = searches.length === 0

  if (isLoading) {
    return <p className="text-sm text-stone-500">Loading…</p>
  }

  return (
    <div className="space-y-8">
      <WatchSearch isFirstVisit={isFirstVisit} />

      <ProviderStatusList
        facebookStatus={facebookStatus}
        loading={providersLoading}
      />

      {!isFirstVisit && (
        <>
          <WatchingList
            items={sortedSearches}
            runningId={runningId}
            lastCheckedLabel={
              lastCheckedAt
                ? `Checked ${formatRelativeTime(lastCheckedAt)}`
                : null
            }
          />

          <RecentListings listings={listings} searches={searches} />

          <RecentActivity searches={searches} />
        </>
      )}
    </div>
  )
}
