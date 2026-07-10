import { prisma } from '../lib/prisma'
import { Search } from '../types/search'

export async function getAllSearches(): Promise<Search[]> {
  return prisma.savedSearch.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function createSearch(name: string): Promise<Search> {
  return prisma.savedSearch.create({
    data: { name },
  })
}

export async function deleteSearch(id: string): Promise<boolean> {
  const result = await prisma.savedSearch.deleteMany({
    where: { id },
  })

  return result.count > 0
}
