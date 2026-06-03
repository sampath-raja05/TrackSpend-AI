import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";

type PrismaClientSingleton = PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const dbPath = path.join(process.cwd(), "dev.db");
let db: any = null;

function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
  }

  return db;
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3(getDatabase());

  return new PrismaClient({
    adapter,
    errorFormat: "pretty",
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
