import type { RunSearchResult, SavedSearch } from './types'

export const API_BASE = 'http://localhost:3000'

export async function fetchSearches(): Promise<SavedSearch[]> {
  const response = await fetch(`${API_BASE}/searches`)
  if (!response.ok) throw new Error('Failed to load searches')
  return response.json()
}

export async function fetchListings() {
  const response = await fetch(`${API_BASE}/listings`)
  if (!response.ok) throw new Error('Failed to load listings')
  return response.json()
}

export async function createSearch(body: object): Promise<SavedSearch> {
  const response = await fetch(`${API_BASE}/searches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error('Failed to save search')
  return response.json()
}

export async function deleteSearch(id: string) {
  const response = await fetch(`${API_BASE}/searches/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete search')
}

export async function updateSearch(
  id: string,
  body: object,
): Promise<SavedSearch> {
  const response = await fetch(`${API_BASE}/searches/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error('Failed to update search')
  return response.json()
}

export async function runSearch(id: string): Promise<RunSearchResult> {
  const response = await fetch(`${API_BASE}/searches/${id}/run`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to check search')
  return response.json()
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`)
  const data = await response.json()
  return data.status === 'ok'
}
