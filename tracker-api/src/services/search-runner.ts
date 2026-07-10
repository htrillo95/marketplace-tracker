import { saveNewListings } from '../store/listings'
import { getSearchById } from '../store/searches'
import { scrapeMarketplaceSearch } from './facebook-scraper'

export type RunSearchResult = {
  totalScraped: number
  newListings: number
  skippedDuplicates: number
}

export class RunSearchError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'RunSearchError'
  }
}

export async function runSavedSearch(
  searchId: string,
): Promise<RunSearchResult | null> {
  const search = await getSearchById(searchId)

  if (!search) {
    return null
  }

  try {
    const listings = await scrapeMarketplaceSearch(search.name, {
      headless: process.env.MARKETPLACE_HEADLESS !== 'false',
    })

    const { saved, skipped } = await saveNewListings(listings)

    return {
      totalScraped: listings.length,
      newListings: saved,
      skippedDuplicates: skipped,
    }
  } catch (error) {
    throw new RunSearchError(`Failed to run saved search "${search.name}"`, {
      cause: error,
    })
  }
}
