import { useFacebookConnection } from '../../context/FacebookConnectionContext'

type Props = {
  className?: string
}

export function FacebookConnectPrompt({ className = '' }: Props) {
  const { isLoading, status, openConnectFlow } =
    useFacebookConnection()

  if (isLoading || status === 'connected') return null

  const isReconnect =
    status === 'session_expired' || status === 'connection_error'

  return (
    <aside
      className={`rounded-2xl border border-stone-200/80 bg-white px-4 py-3.5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-stone-900">
            Facebook Marketplace
          </p>
          <p className="mt-0.5 text-sm text-stone-500">
            {isReconnect
              ? status === 'session_expired'
                ? 'Session expired'
                : 'Connection error'
              : 'Not connected'}
          </p>
          <p className="mt-2 text-sm text-stone-600">
            {isReconnect
              ? 'Reconnect Facebook to keep monitoring Marketplace.'
              : 'Connect Facebook to begin monitoring Marketplace.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            openConnectFlow({ preferReconnect: isReconnect })
          }
          className="shrink-0 rounded-xl bg-stone-900 px-3.5 py-2 text-sm font-medium text-white active:bg-stone-800"
        >
          {isReconnect ? 'Reconnect' : 'Connect'}
        </button>
      </div>
    </aside>
  )
}
