import { PrismaClient } from '@prisma/client'

console.log('7. creating Prisma client')
export const prisma = new PrismaClient()
console.log('8. prisma client created')
