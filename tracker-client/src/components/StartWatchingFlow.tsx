import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { HELPERS } from '../lib/copy'
import type { NewSearchForm } from '../types'

const EXAMPLES = [
  'PlayStation 5',
  'Floor lamp',
  'Road bike',
  'Canon camera',
  'Couch',
  'Stroller',
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
  compact?: boolean
}

export function StartWatchingFlow({ compact = false }: Props) {
  const navigate = useNavigate()
  const { startWatching } = useAppData()

  const [query, setQuery] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [details, setDetails] = useState(defaultDetails)
  const [phase, setPhase] = useState<'idle' | 'setting-up'>('idle')
  const [error, setError] = useState<string | null>(null)

  function revealDetails(nextQuery: string) {
    const trimmed = nextQuery.trim()
    if (!trimmed) return
    setQuery(trimmed)
    setShowDetails(true)
    setError(null)
  }

  function handleQueryKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      revealDetails(query)
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
    <section className={compact ? 'space-y-4' : 'space-y-8'}>
      <div>
        <h2
          className={`font-medium text-stone-900 ${
            compact ? 'text-base' : 'text-2xl tracking-tight'
          }`}
        >
          {compact ? 'Watch something else' : 'Looking for something?'}
        </h2>

        {!compact && (
          <>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-stone-600">
              Tell Marketplace Tracker what you&apos;re trying to buy.
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-500">
              We&apos;ll keep checking Facebook Marketplace and let you know when
              something new appears.
            </p>
          </>
        )}

        <div className="mt-5">
          <label htmlFor="looking-for" className="sr-only">
            What are you looking for?
          </label>
          <input
            id="looking-for"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleQueryKeyDown}
            placeholder="Try PlayStation 5, floor lamp, couch…"
            className="w-full border-b border-stone-300 bg-transparent py-3 text-lg text-stone-900 placeholder:text-stone-400 focus:border-stone-800 focus:outline-none"
            autoComplete="off"
          />
        </div>

        {!showDetails && (
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => revealDetails(example)}
                className="text-sm text-stone-500 transition-colors hover:text-stone-900"
              >
                {example}
              </button>
            ))}
          </div>
        )}

        {!showDetails && !compact && (
          <p className="mt-8 text-xs text-stone-400">{HELPERS.notFacebook}</p>
        )}
      </div>

      {showDetails && (
        <form onSubmit={handleStartWatching} className="space-y-6">
          <p className="text-sm text-stone-600">
            Looking for{' '}
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

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="How far to search">
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

            <Field label="Maximum price (optional)">
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

          <Field label="How many listings to check">
            <div className="flex flex-wrap gap-2">
              {RESULTS_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateDetail('resultsPerSearch', value)}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
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
              placeholder={query.trim() || 'Living room lamp'}
              className={inputClass}
            />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={phase === 'setting-up'}
            className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
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
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

const inputClass =
  'w-full border-b border-stone-200 bg-transparent py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-800 focus:outline-none'
