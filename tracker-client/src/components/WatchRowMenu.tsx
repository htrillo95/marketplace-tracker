import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import type { SavedSearch } from '../types'
import { WatchSettingsDialog } from './WatchSettingsDialog'

type Props = {
  search: SavedSearch
}

export function WatchRowMenu({ search }: Props) {
  const navigate = useNavigate()
  const { removeSearch, checkMarketplace, runningId } = useAppData()
  const [isOpen, setIsOpen] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const isChecking = runningId === search.id

  async function handleCheckNow() {
    setIsOpen(false)
    try {
      await checkMarketplace(search.id)
      navigate(`/search/${search.id}`)
    } catch {
      // error shown via context
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Stop watching "${search.name}"?`)) return
    setIsRemoving(true)
    setIsOpen(false)
    try {
      await removeSearch(search.id)
      navigate('/')
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          disabled={isRemoving || isChecking}
          aria-label={`Options for ${search.name}`}
          className="px-2 py-1 text-stone-400 hover:text-stone-700 disabled:opacity-40"
        >
          ···
        </button>

        {isOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10"
              aria-label="Close menu"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 z-20 mt-1 min-w-44 rounded-lg bg-white py-1 shadow-lg shadow-stone-900/10">
              <button
                type="button"
                onClick={() => void handleCheckNow()}
                disabled={isChecking}
                className="block w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
              >
                {isChecking ? 'Checking…' : 'Check Marketplace now'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setShowEdit(true)
                }}
                className="block w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
              >
                Edit settings
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-stone-50"
              >
                Stop watching
              </button>
            </div>
          </>
        )}
      </div>

      <WatchSettingsDialog
        search={search}
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
      />
    </>
  )
}
