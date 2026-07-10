import { prisma } from '../lib/prisma'

export type ListingInput = {
  source: string
  listingUrl: string
  title: string | null
  price: string | null
  location: string | null
  imageUrl: string | null
}

export async function saveNewListings(
  listings: ListingInput[],
): Promise<{ saved: number; skipped: number }> {
  if (listings.length === 0) {
    return { saved: 0, skipped: 0 }
  }

  const result = await prisma.listing.createMany({
    data: listings,
    skipDuplicates: true,
  })

  return {
    saved: result.count,
    skipped: listings.length - result.count,
  }
}
