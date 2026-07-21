import { useState } from 'react'
import {
  connectProvider,
  disconnectProvider,
  fetchConnection,
  reconnectProvider,
} from '../../api'
import { formatRelativeTime } from '../../lib/format'
import type {
  ConnectProviderResult,
  ProviderConnection,
} from '../../types'
import { ConnectionStatusBadge } from './ConnectionStatusBadge'

type ProviderConnectionCardProps = {
  connection: ProviderConnection
  onUpdated: (connection: ProviderConnection) => void
}

export function ProviderConnectionCard({
  connection,
  onUpdated,
}: ProviderConnectionCardProps) {
  const [busy, setBusy] = useState(false)
  const [actionNote, setActionNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { status, providerId } = connection
  const needsConnect = status === 'not_connected'
  const needsReconnect =
    status === 'session_expired' || status === 'connection_error'
  const isConnected = status === 'connected'

  async function refreshStatus() {
    setBusy(true)
    setError(null)
    try {
      const next = await fetchConnection(providerId)
      onUpdated(next)
      setActionNote(null)
    } catch {
      setError('Could not refresh connection status.')
    } finally {
      setBusy(false)
    }
  }

  async function handleConnectOrReconnect(mode: 'connect' | 'reconnect') {
    setBusy(true)
    setError(null)
    try {
      const result: ConnectProviderResult =
        mode === 'reconnect'
          ? await reconnectProvider(providerId)
          : await connectProvider(providerId)

      onUpdated(result.connection)
      const commandHint = result.action.command
        ? ` Run \`${result.action.command}\` in tracker-api.`
        : ''
      setActionNote(`${result.action.message}${commandHint}`)
    } catch {
      setError(
        mode === 'reconnect'
          ? 'Could not start reconnection.'
          : 'Could not start connection.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleDisconnect() {
    setBusy(true)
    setError(null)
    try {
      const result = await disconnectProvider(providerId)
      onUpdated(result.connection)
      setActionNote(result.message)
    } catch {
      setError('Could not disconnect.')
    } finally {
      setBusy(false)
    }
  }

  const lastConnectedLabel = connection.lastConnectedAt
    ? formatRelativeTime(connection.lastConnectedAt)
    : 'Unavailable'

  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white/80 p-6 shadow-sm shadow-stone-200/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-stone-900">
            {connection.displayName}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-500">
            {connection.description}
          </p>
        </div>
        <ConnectionStatusBadge status={status} />
      </div>

      <dl className="mt-6 grid gap-4 border-t border-stone-100 pt-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">
            Connection Status
          </dt>
          <dd className="mt-1.5 text-sm text-stone-800">
            <ConnectionStatusBadge status={status} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">
            Last Connected
          </dt>
          <dd className="mt-1.5 text-sm text-stone-800">{lastConnectedLabel}</dd>
        </div>
      </dl>

      {connection.message && (
        <p className="mt-5 text-sm leading-relaxed text-stone-600">
          {connection.message}
        </p>
      )}

      {actionNote && (
        <p className="mt-4 rounded-xl bg-stone-50 px-4 py-3 text-sm leading-relaxed text-stone-700">
          {actionNote}
        </p>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        {needsConnect && (
          <button
            type="button"
            disabled={busy}
            onClick={() => handleConnectOrReconnect('connect')}
            className="rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            Connect Facebook
          </button>
        )}

        {(needsReconnect || isConnected) && (
          <button
            type="button"
            disabled={busy}
            onClick={() => handleConnectOrReconnect('reconnect')}
            className="rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            Reconnect Facebook
          </button>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={refreshStatus}
          className="rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
        >
          Refresh status
        </button>

        <button
          type="button"
          disabled={busy || needsConnect}
          onClick={handleDisconnect}
          title="Disconnect is not fully implemented yet"
          className="rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-500 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Disconnect
        </button>
      </div>
    </section>
  )
}
