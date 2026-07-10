import { Router } from 'express'
import {
  createSearch,
  deleteSearch,
  getAllSearches,
} from '../store/searches'

const router = Router()

router.get('/', (_req, res) => {
  res.json(getAllSearches())
})

router.post('/', (req, res) => {
  const { name } = req.body

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Name is required' })
    return
  }

  const search = createSearch(name.trim())
  res.status(201).json(search)
})

router.delete('/:id', (req, res) => {
  const deleted = deleteSearch(req.params.id)

  if (!deleted) {
    res.status(404).json({ error: 'Search not found' })
    return
  }

  res.status(204).send()
})

export default router
