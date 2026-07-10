import { randomUUID } from 'crypto'
import { Search } from '../types/search'

const searches: Search[] = []

export function getAllSearches(): Search[] {
  return searches
}

export function createSearch(name: string): Search {
  const search: Search = {
    id: randomUUID(),
    name,
  }

  searches.push(search)
  return search
}

export function deleteSearch(id: string): boolean {
  const index = searches.findIndex((search) => search.id === id)

  if (index === -1) {
    return false
  }

  searches.splice(index, 1)
  return true
}
