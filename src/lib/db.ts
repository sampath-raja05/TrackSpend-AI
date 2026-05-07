import path from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

const databaseUrl = normalizeDatabaseUrl(getSqliteDatabaseUrl());

type PrismaGlobal = {
  prisma: PrismaClient | undefined;
  prismaAdapter: PrismaBetterSqlite3 | undefined;
};

const globalForPrisma = globalThis as typeof globalThis & PrismaGlobal;

let prismaSingleton: PrismaClient | undefined;
let adapterSingleton: PrismaBetterSqlite3 | undefined;

function getSqliteDatabaseUrl() {
  const configuredUrl = process.env.DATABASE_URL;

  if (configuredUrl === ':memory:' || configuredUrl?.startsWith('file:')) {
    return configuredUrl;
  }

  return 'file:./dev.db';
}

function normalizeDatabaseUrl(url: string) {
  if (url === ':memory:' || !url.startsWith('file:')) {
    return url;
  }

  const rawPath = url.slice('file:'.length);
  if (!rawPath) {
    return url;
  }

  const absolutePath = path.isAbsolute(rawPath)
    ? rawPath
    : path.resolve(/* turbopackIgnore: true */ process.cwd(), rawPath);

  return `file:${absolutePath.replace(/\\/g, '/')}`;
}

function getPrismaAdapter() {
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prismaAdapter ??= new PrismaBetterSqlite3(
      { url: databaseUrl },
      { timestampFormat: 'unixepoch-ms' }
    );

    return globalForPrisma.prismaAdapter;
  }

  adapterSingleton ??= new PrismaBetterSqlite3(
    { url: databaseUrl },
    { timestampFormat: 'unixepoch-ms' }
  );

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
