import { PrismaClient } from '@prisma/client'

// Prevent multiple instances in development (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy initialization - only create client when accessed
let prismaInstance: PrismaClient | undefined

export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    if (!prismaInstance) {
      // Check if DATABASE_URL is available
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set. Please configure it in AWS Amplify Console.')
      }
      
      prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
      
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = prismaInstance
      }
    }
    
    return prismaInstance[prop as keyof PrismaClient]
  }
})
