import { prisma } from '../lib/prisma'
import { Listing } from '../types/listing'

export type ListingInput = {
  source: string
  listingUrl: string
  title: string | null
  price: string | null
  location: string | null
  imageUrl: string | null
}

export async function getAllListings(): Promise<Listing[]> {
  return prisma.listing.findMany({
    orderBy: { seenAt: 'desc' },
  })
}

export async function saveNewListings(
  listings: ListingInput[],
  savedSearchId?: string,
): Promise<{ saved: number; skipped: number; newListingIds: string[] }> {
  const newListingIds: string[] = []
  let saved = 0
  let skipped = 0

  for (const listing of listings) {
    try {
      const created = await prisma.listing.create({
        data: {
          ...listing,
          savedSearchId: savedSearchId ?? null,
        },
      })
      newListingIds.push(created.id)
      saved++
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        skipped++
      } else {
        throw error
      }
    }
  }

  return { saved, skipped, newListingIds }
}
