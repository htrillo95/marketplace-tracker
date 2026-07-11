import { useMemo } from 'react'
import type { SavedSearch } from '../types'
import { buildRecentActivity, formatActivityTime } from '../lib/activity'

type Props = {
  searches: SavedSearch[]
}

export function RecentActivity({ searches }: Props) {
  const events = useMemo(() => buildRecentActivity(searches), [searches])

  if (events.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-stone-900">Recent activity</h2>
      <ul className="space-y-2">
        {events.map((event) => (
          <li key={event.id} className="text-sm text-stone-500">
            {event.message}
            <span className="text-stone-400">
              {' '}
              · {formatActivityTime(event.timestamp)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
