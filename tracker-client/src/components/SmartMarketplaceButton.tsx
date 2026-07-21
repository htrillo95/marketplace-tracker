import { useFacebookConnection } from '../context/FacebookConnectionContext'

type Props = {
  checking?: boolean
  onCheck: () => void | Promise<void>
  className?: string
}

/**
 * Primary marketplace action — label and behavior follow Facebook connection state.
 */
export function SmartMarketplaceButton({
  checking = false,
  onCheck,
  className = '',
}: Props) {
  const { status, isLoading, ensureFacebookConnected } = useFacebookConnection()

  if (checking) return null

  const baseClass = `flex min-h-12 w-full items-center justify-center rounded-2xl bg-stone-900 text-[15px] font-medium text-white active:bg-stone-800 disabled:opacity-60 sm:w-auto sm:px-5 ${className}`

  if (isLoading) {
    return (
      <button type="button" disabled className={baseClass}>
        Loading…
      </button>
    )
  }

  async function handlePress() {
    if (status === 'connected') {
      await onCheck()
      return
    }

    const ready = await ensureFacebookConnected({
      preferReconnect:
        status === 'session_expired' || status === 'connection_error',
    })
    if (ready) {
      await onCheck()
    }
  }

  let label = 'Connect Facebook'
  if (status === 'connected') label = 'Check Marketplace'
  else if (status === 'session_expired' || status === 'connection_error') {
    label = 'Reconnect Facebook'
  }

  return (
    <button
      type="button"
      className={baseClass}
      onClick={() => void handlePress()}
    >
      {label}
    </button>
  )
}
