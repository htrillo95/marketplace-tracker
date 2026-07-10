import { Router } from 'express'
import { runSavedSearch } from '../services/search-runner'
import {
  createSearch,
  deleteSearch,
  getAllSearches,
} from '../store/searches'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const searches = await getAllSearches()
    res.json(searches)
  } catch {
    res.status(500).json({ error: 'Failed to load searches' })
  }
})

router.post('/', async (req, res) => {
  const { name } = req.body

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Name is required' })
    return
  }

  try {
    const search = await createSearch(name.trim())
    res.status(201).json(search)
  } catch {
    res.status(500).json({ error: 'Failed to create search' })
  }
})

router.post('/:id/run', async (req, res) => {
  try {
    const result = await runSavedSearch(req.params.id)

    if (!result) {
      res.status(404).json({ error: 'Search not found' })
      return
    }

    res.json(result)
  } catch (error) {
    console.error('Failed to run search:', error)

    if (error instanceof Error && error.cause) {
      console.error('Caused by:', error.cause)
    }

    res.status(500).json({ error: 'Failed to run search' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteSearch(req.params.id)

    if (!deleted) {
      res.status(404).json({ error: 'Search not found' })
      return
    }

    res.status(204).send()
  } catch {
    res.status(500).json({ error: 'Failed to delete search' })
  }
})

export default router
