import { Link } from 'react-router-dom'
import type { ConnectionStatus } from '../types'
import { SectionLabel } from './SectionLabel'

export type ProviderSurfaceItem = {
  id: string
  name: string
  /** Live Facebook status, or static roadmap labels */
  statusLabel: string
  tone: 'live' | 'muted'
  href?: string
}

type Props = {
  facebookStatus: ConnectionStatus | null
  loading?: boolean
}

function facebookLabel(status: ConnectionStatus | null): string {
  if (!status) return '…'
  switch (status) {
    case 'connected':
      return 'Connected'
    case 'session_expired':
      return 'Session expired'
    case 'connection_error':
      return 'Error'
    case 'not_connected':
    default:
      return 'Not connected'
  }
}

export function ProviderStatusList({ facebookStatus, loading }: Props) {
  const items: ProviderSurfaceItem[] = [
    {
      id: 'facebook',
      name: 'Facebook Marketplace',
      statusLabel: loading ? '…' : facebookLabel(facebookStatus),
      tone: facebookStatus === 'connected' ? 'live' : 'muted',
      href: '/settings',
    },
    {
      id: 'craigslist',
      name: 'Craigslist',
      statusLabel: 'Coming soon',
      tone: 'muted',
    },
    {
      id: 'offerup',
      name: 'OfferUp',
      statusLabel: 'Planned',
      tone: 'muted',
    },
  ]

  return (
    <section className="space-y-2">
      <SectionLabel
        action={
          <Link
            to="/settings"
            className="text-[13px] font-medium text-stone-500 active:text-stone-800"
          >
            Manage
          </Link>
        }
      >
        Providers
      </SectionLabel>
      <ul className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white">
        {items.map((item, index) => {
          const rowClass = `flex min-h-12 items-center justify-between gap-3 px-4 ${
            index > 0 ? 'border-t border-stone-100' : ''
          }`

          const content = (
            <>
              <span className="text-[15px] text-stone-900">{item.name}</span>
              <span
                className={`shrink-0 text-sm ${
                  item.tone === 'live'
                    ? 'font-medium text-emerald-700'
                    : 'text-stone-400'
                }`}
              >
                {item.statusLabel}
              </span>
            </>
          )

          return (
            <li key={item.id}>
              {item.href ? (
                <Link to={item.href} className={`${rowClass} active:bg-stone-50`}>
                  {content}
                </Link>
              ) : (
                <div className={rowClass}>{content}</div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
