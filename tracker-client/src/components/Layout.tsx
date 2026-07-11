import { Link, Outlet } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export function Layout() {
  const { error } = useAppData()

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-stone-900">
      <header className="border-b border-stone-200/60">
        <div className="mx-auto max-w-2xl px-6 py-6">
          <Link to="/" className="block">
            <p className="text-base font-semibold tracking-tight text-stone-900">
              Scout
            </p>
            <p className="mt-1 text-sm text-stone-500">
              We&apos;ll tell you when Marketplace changes.
            </p>
          </Link>
        </div>
      </header>

      {error && (
        <div className="mx-auto max-w-2xl px-6 pt-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <main className="mx-auto max-w-2xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
