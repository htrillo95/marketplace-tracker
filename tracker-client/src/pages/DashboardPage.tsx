import { Link } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { RecentActivity } from '../components/RecentActivity'
import { WatchRowMenu } from '../components/WatchRowMenu'
import { WatchSearchHero } from '../components/WatchSearchHero'
import { useAppData } from '../context/AppDataContext'
import { getCompactWatchStatus } from '../lib/copy'
import { useAttentionCounts } from '../lib/listings'
import { recordVisit } from '../lib/storage'

export function DashboardPage() {
  const { searches, listings, isLoading, runningId, statusVersion } = useAppData()
  const { perSearch } = useAttentionCounts(searches, listings, statusVersion)

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

  const isFirstVisit = searches.length === 0

  if (isLoading) {
    return <p className="text-sm text-stone-500">One moment…</p>
  }

  return (
    <div className="space-y-10">
      <WatchSearchHero isFirstVisit={isFirstVisit} />

      {!isFirstVisit && (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-stone-900">Watching</h2>
            <ul className="divide-y divide-stone-200/50">
              {sortedSearches.map(({ search, count }) => {
                const isActive = count > 0
                const isChecking = runningId === search.id

                return (
                  <li
                    key={search.id}
                    className={`flex items-center gap-2 py-3.5 ${
                      isActive ? '' : 'opacity-50'
                    }`}
                  >
                    <Link
                      to={`/search/${search.id}`}
                      className="flex min-w-0 flex-1 items-baseline justify-between gap-4"
                    >
                      <span className="font-medium text-stone-900">
                        {search.name}
                      </span>
                      <span
                        className={`shrink-0 text-sm ${
                          isActive
                            ? 'font-medium text-emerald-700'
                            : 'text-stone-400'
                        }`}
                      >
                        {getCompactWatchStatus(count, isChecking)}
                      </span>
                    </Link>
                    <WatchRowMenu search={search} />
                  </li>
                )
              })}
            </ul>
          </section>

          <RecentActivity searches={searches} />
        </>
      )}
    </div>
  )
}
