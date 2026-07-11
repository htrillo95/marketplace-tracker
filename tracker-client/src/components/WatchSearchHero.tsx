import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import type { NewSearchForm } from '../types'
import { getGreeting } from '../lib/format'

const SUGGESTIONS = [
  'PS5',
  'Road bike',
  'Floor lamp',
  'Canon camera',
  'Patio furniture',
  'Pokemon cards',
]

const RESULTS_OPTIONS = ['5', '10', '20', '50'] as const

const defaultDetails = {
  location: 'Philadelphia',
  radius: '25',
  maxPrice: '',
  resultsPerSearch: '10',
  name: '',
}

type Props = {
  isFirstVisit?: boolean
}

export function WatchSearchHero({ isFirstVisit = false }: Props) {
  const navigate = useNavigate()
  const { startWatching } = useAppData()

  const [query, setQuery] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [details, setDetails] = useState(defaultDetails)
  const [phase, setPhase] = useState<'idle' | 'setting-up'>('idle')
  const [error, setError] = useState<string | null>(null)

  function revealDetails() {
    const trimmed = query.trim()
    if (!trimmed) return
    setQuery(trimmed)
    setShowDetails(true)
    setError(null)
  }

  function handleQueryKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      revealDetails()
    }
  }

  function updateDetail(field: keyof typeof defaultDetails, value: string) {
    setDetails((current) => ({ ...current, [field]: value }))
  }

  async function handleStartWatching(event: React.FormEvent) {
    event.preventDefault()
    if (!query.trim() || !details.location.trim() || !details.radius.trim()) return

    const form: NewSearchForm = {
      query: query.trim(),
      name: details.name,
      location: details.location,
      radius: details.radius,
      maxPrice: details.maxPrice,
      resultsPerSearch: details.resultsPerSearch,
    }

    setPhase('setting-up')
    setError(null)

    try {
      const search = await startWatching(form)
      navigate(`/search/${search.id}`, {
        state: {
          justCreated: true,
          displayName: search.name,
          autoCheck: true,
        },
      })
    } catch {
      setPhase('idle')
      setError("That didn't work — please try again.")
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-lg text-stone-600">{getGreeting()}.</p>
        <label
          htmlFor="watch-search"
          className="mt-4 block text-sm font-medium text-stone-900"
        >
          What should Scout watch?
        </label>
        <input
          id="watch-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (showDetails && !e.target.value.trim()) setShowDetails(false)
          }}
          onKeyDown={handleQueryKeyDown}
          placeholder="Search Marketplace…"
          className="mt-2 w-full rounded-[10px] bg-stone-200/50 px-3.5 py-2.5 text-base text-stone-900 placeholder:text-stone-400 focus:bg-stone-200/70 focus:outline-none"
          autoComplete="off"
          enterKeyHint="search"
        />
      </div>

      {!showDetails && (
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className="text-sm text-stone-400 transition-colors hover:text-stone-700"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {isFirstVisit && !showDetails && (
        <p className="text-sm text-stone-500">
          Start watching something and we&apos;ll check Marketplace for you.
        </p>
      )}

      {showDetails && (
        <form onSubmit={handleStartWatching} className="space-y-5 border-t border-stone-200/60 pt-5">
          <p className="text-sm text-stone-600">
            Watching for{' '}
            <span className="font-medium text-stone-900">{query.trim()}</span>
          </p>

          <Field label="Location">
            <input
              value={details.location}
              onChange={(e) => updateDetail('location', e.target.value)}
              placeholder="Philadelphia"
              required
              className={inputClass}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Radius">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={details.radius}
                  onChange={(e) => updateDetail('radius', e.target.value)}
                  placeholder="25"
                  required
                  min={1}
                  className={inputClass}
                />
                <span className="shrink-0 text-sm text-stone-500">miles</span>
              </div>
            </Field>

            <Field label="Max price (optional)">
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm text-stone-500">$</span>
                <input
                  type="number"
                  value={details.maxPrice}
                  onChange={(e) => updateDetail('maxPrice', e.target.value)}
                  placeholder="No limit"
                  min={1}
                  className={inputClass}
                />
              </div>
            </Field>
          </div>

          <Field label="Listings to check">
            <div className="flex flex-wrap gap-2">
              {RESULTS_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateDetail('resultsPerSearch', value)}
                  className={`rounded-full px-3 py-1 text-sm ${
                    details.resultsPerSearch === value
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Nickname (optional)">
            <input
              value={details.name}
              onChange={(e) => updateDetail('name', e.target.value)}
              placeholder={query.trim()}
              className={inputClass}
            />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={phase === 'setting-up'}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
          >
            {phase === 'setting-up' ? 'Getting things ready…' : 'Start Watching'}
          </button>
        </form>
      )}
    </section>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-sm text-stone-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

const inputClass =
  'w-full rounded-[8px] bg-stone-200/40 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:bg-stone-200/60 focus:outline-none'
