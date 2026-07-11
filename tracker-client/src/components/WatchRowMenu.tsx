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
  const { removeSearch } = useAppData()
  const [isOpen, setIsOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'edit' | 'rename' | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  async function handleDelete() {
    if (!window.confirm(`Delete "${search.name}"?`)) return
    setIsRemoving(true)
    setIsOpen(false)
    try {
      await removeSearch(search.id)
      navigate('/')
    } finally {
      setIsRemoving(false)
    }
  }

  function openDialog(mode: 'edit' | 'rename') {
    setIsOpen(false)
    setDialogMode(mode)
  }

  return (
    <>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          disabled={isRemoving}
          aria-label={`Options for ${search.name}`}
          className="px-1.5 py-1 text-sm text-stone-400 hover:text-stone-600 disabled:opacity-40"
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
            <div className="absolute right-0 z-20 mt-1 min-w-36 rounded-lg border border-stone-200/80 bg-white py-1 shadow-sm shadow-stone-900/5">
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-stone-50"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => openDialog('rename')}
                className="block w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => openDialog('edit')}
                className="block w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
              >
                Edit search
              </button>
            </div>
          </>
        )}
      </div>

      {dialogMode && (
        <WatchSettingsDialog
          search={search}
          mode={dialogMode}
          isOpen
          onClose={() => setDialogMode(null)}
        />
      )}
    </>
  )
}
