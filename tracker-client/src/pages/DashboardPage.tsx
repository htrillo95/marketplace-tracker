import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { StartWatchingFlow } from '../components/StartWatchingFlow'
import { WatchRowMenu } from '../components/WatchRowMenu'
import { useAppData } from '../context/AppDataContext'
import {
  formatCheckedAt,
  formatWatchDetails,
  getGreeting,
} from '../lib/format'
import { getHomeSummary, getWatchStatusLabel, HELPERS } from '../lib/copy'
import { useAttentionCounts } from '../lib/listings'
import { recordVisit } from '../lib/storage'

export function DashboardPage() {
  const { searches, listings, isLoading, runningId, statusVersion } = useAppData()
  const { perSearch, total, withNew } = useAttentionCounts(
    searches,
    listings,
    statusVersion,
  )

  const [showAddSearch, setShowAddSearch] = useState(false)

  useEffect(() => {
    return () => {
      recordVisit()
    }
  }, [])

  const sortedSearches = useMemo(() => {
    return [...perSearch].sort((a, b) => {
      if (a.count > 0 && b.count === 0) return -1
      if (a.count === 0 && b.count > 0) return 1
      return a.search.name.localeCompare(b.search.name)
    })
  }, [perSearch])

  const isNewUser = searches.length === 0

  if (isLoading) {
    return <p className="text-sm text-stone-500">One moment…</p>
  }

  if (isNewUser) {
    return <StartWatchingFlow />
  }

  return (
    <div className="space-y-10">
      <section className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            {getGreeting()}.
          </h1>
          <p className="mt-3 text-lg text-stone-600">
            {getHomeSummary(total, withNew)}
          </p>
          {total === 0 && (
            <p className="mt-2 text-sm text-stone-500">
              Everything you&apos;re watching is up to date.
            </p>
          )}
        </div>

        <ul className="divide-y divide-stone-200/60">
          {sortedSearches.map(({ search, count }) => {
            const isActive = count > 0
            const isChecking = runningId === search.id

            return (
              <li
                key={search.id}
                className={`flex items-start gap-2 py-5 transition-opacity ${
                  isActive ? '' : 'opacity-55 hover:opacity-80'
                }`}
              >
                <Link to={`/search/${search.id}`} className="min-w-0 flex-1">
                  <p
                    className={`font-medium text-stone-900 ${
                      isActive ? 'text-lg' : 'text-base'
                    }`}
                  >
                    {search.name}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatWatchDetails(search)}
                  </p>
                  <p className="mt-1 text-sm text-stone-400">
                    {formatCheckedAt(search.lastCheckedAt)}
                  </p>
                  <p
                    className={`mt-2 text-sm ${
                      isActive
                        ? 'font-medium text-emerald-700'
                        : 'text-stone-400'
                    }`}
                  >
                    {getWatchStatusLabel(count, isChecking)}
                  </p>
                </Link>
                <WatchRowMenu search={search} />
              </li>
            )
          })}
        </ul>

        <p className="text-xs text-stone-400">{HELPERS.newListingsOnly}</p>
      </section>

      <section className="border-t border-stone-200/60 pt-8">
        {showAddSearch ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowAddSearch(false)}
              className="text-sm text-stone-500 hover:text-stone-800"
            >
              Cancel
            </button>
            <StartWatchingFlow compact />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddSearch(true)}
            className="text-sm text-stone-500 underline decoration-stone-300 underline-offset-4 hover:text-stone-800 hover:decoration-stone-500"
          >
            Watch something else
          </button>
        )}
      </section>
    </div>
  )
}
