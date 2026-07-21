export type SavedSearch = {
  id: string
  name: string
  query: string
  maxPrice: number | null
  location: string
  radius: number
  resultsPerSearch: number
  isActive: boolean
  lastCheckedAt: string | null
  lastNewListings: number
  lastTotalScraped: number
  lastSkippedDuplicates: number
  lastRunNewListingIds: string[]
  createdAt: string
}

export type Listing = {
  id: string
  source: string
  listingUrl: string
  title: string | null
  price: string | null
  location: string | null
  imageUrl: string | null
  savedSearchId: string | null
  seenAt: string
}

export type ListingStatus = 'new' | 'reviewed' | 'archived'

export type RunSearchResult = {
  searchId: string
  searchName: string
  scannedAt: string
  totalScraped: number
  newListings: number
  skippedDuplicates: number
  newListingIds: string[]
}

export type NewSearchForm = {
  name: string
  query: string
  maxPrice: string
  location: string
  radius: string
  resultsPerSearch: string
}
