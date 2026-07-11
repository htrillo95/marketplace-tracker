import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckingProgress } from '../components/CheckingProgress'
import { ListingCard } from '../components/ListingCard'
import { WatchRowMenu } from '../components/WatchRowMenu'
import { useAppData } from '../context/AppDataContext'
import {
  getCheckCompleteMessage,
  getWorkspaceResultSummary,
  HELPERS,
} from '../lib/copy'
import { formatWatchDetails } from '../lib/format'
import { partitionListingsForSearch } from '../lib/listings'

type LocationState = {
  justCreated?: boolean
  displayName?: string
  autoCheck?: boolean
}

export function SearchWorkspacePage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const locationState = location.state as LocationState | null
  const { searches, listings, isLoading, runningId, checkMarketplace, statusVersion } =
    useAppData()

  const [showPrevious, setShowPrevious] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [checkCompleteMessage, setCheckCompleteMessage] = useState<string | null>(
    null,
  )
  const autoCheckStarted = useRef(false)

  const search = searches.find((item) => item.id === id)

  const buckets = useMemo(() => {
    if (!search) return null
    return partitionListingsForSearch(listings, search, statusVersion)
  }, [listings, search, statusVersion])

  const newListings = buckets?.new ?? []
  const previousListings = useMemo(() => {
    if (!buckets) return []
    return [...buckets.reviewed, ...buckets.archived]
  }, [buckets])

  const handleCheck = useCallback(async () => {
    if (!search) return

    setIsChecking(true)
    setCheckCompleteMessage(null)

    try {
      const result = await checkMarketplace(search.id)
      setCheckCompleteMessage(getCheckCompleteMessage(result.newListings))
    } catch {
      // error shown via context
    } finally {
      setIsChecking(false)
    }
  }, [search, checkMarketplace])

  useEffect(() => {
    if (!search || !locationState?.autoCheck || autoCheckStarted.current) return

    autoCheckStarted.current = true
    navigate(location.pathname, {
      replace: true,
      state: {
        justCreated: locationState.justCreated,
        displayName: locationState.displayName,
      },
    })
    void handleCheck()
  }, [search, locationState, navigate, location.pathname, handleCheck])

  if (isLoading) {
    return <p className="text-sm text-stone-500">One moment…</p>
  }

  if (!search || !buckets) {
    return (
      <div>
        <p className="text-stone-600">We couldn&apos;t find that watch.</p>
        <p className="mt-2 text-sm text-stone-500">
          It may have been removed from your list.
        </p>
        <Link to="/" className="mt-4 inline-block text-sm text-stone-800 underline">
          Back to Home
        </Link>
      </div>
    )
  }

  const checking = isChecking || runningId === search.id
  const newCount = newListings.length

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <Link to="/" className="text-sm text-stone-500 hover:text-stone-800">
            ← Home
          </Link>
          <WatchRowMenu search={search} />
        </div>

        {locationState?.justCreated && (
          <p className="text-sm text-stone-600">
            You&apos;re now watching &ldquo;{locationState.displayName ?? search.name}
            &rdquo;. We&apos;ll check Marketplace for you.
          </p>
        )}

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            {search.name}
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Watching: {formatWatchDetails(search)}
          </p>
          <p className="mt-4 text-base text-stone-700">
            {checking ? (
              <CheckingProgress />
            ) : checkCompleteMessage ? (
              checkCompleteMessage
            ) : (
              getWorkspaceResultSummary(newCount)
            )}
          </p>
          {!checking && newCount === 0 && !checkCompleteMessage && (
            <p className="mt-2 text-sm text-stone-500">You&apos;re caught up.</p>
          )}
        </div>

        {!checking && (
          <button
            type="button"
            onClick={() => void handleCheck()}
            className="text-sm text-stone-500 underline decoration-stone-300 underline-offset-4 hover:text-stone-800"
          >
            Check Marketplace
          </button>
        )}
      </header>

      {newCount > 0 && !checking && (
        <section className="space-y-4">
          <p className="text-xs text-stone-400">{HELPERS.newListingsOnly}</p>
          <ul className="grid gap-5 sm:grid-cols-2">
            {newListings.map((listing) => (
              <li key={listing.id}>
                <ListingCard listing={listing} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {newCount === 0 && !checking && (
        <p className="text-sm text-stone-500">
          No new listings right now. Check back later, or run a check above.
        </p>
      )}

      {previousListings.length > 0 && (
        <section className="border-t border-stone-200/60 pt-8">
          <button
            type="button"
            onClick={() => setShowPrevious((v) => !v)}
            className="text-sm text-stone-500 hover:text-stone-800"
          >
            {showPrevious ? 'Hide' : 'View'} previously found listings (
            {previousListings.length})
          </button>

          {showPrevious && (
            <ul className="mt-6 grid gap-5 sm:grid-cols-2">
              {previousListings.map((listing) => (
                <li key={listing.id}>
                  <ListingCard listing={listing} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
