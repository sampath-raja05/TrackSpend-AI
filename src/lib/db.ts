import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

type PrismaGlobal = {
  prisma: PrismaClient | undefined;
  prismaAdapter: PrismaPg | undefined;
};

const globalForPrisma = globalThis as typeof globalThis & PrismaGlobal;

let prismaSingleton: PrismaClient | undefined;
let adapterSingleton: PrismaPg | undefined;

function getDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for Prisma Postgres connection.');
  }

  return process.env.DATABASE_URL;
}

function getPrismaAdapter() {
  const connectionString = getDatabaseUrl();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prismaAdapter ??= new PrismaPg({ connectionString });
    return globalForPrisma.prismaAdapter;
  }

  adapterSingleton ??= new PrismaPg({ connectionString });
  return adapterSingleton;
}

export function getPrismaClient() {
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma ??= new PrismaClient({
      adapter: getPrismaAdapter(),
    });

    return globalForPrisma.prisma;
  }

  prismaSingleton ??= new PrismaClient({
    adapter: getPrismaAdapter(),
  });

  return prismaSingleton;
}
