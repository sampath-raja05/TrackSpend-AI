import Database from "better-sqlite3";
import { Pool } from "pg";
import path from "path";
import { randomUUID } from "crypto";

import type { AuditResult } from "@/lib/types";

type AuditRow = {
  id: string;
  createdAt: string;
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  overallEfficiencyScore: number;
  savingsCategory: string;
  aiSummary: string | null;
  itemsData: string;
};

type LeadRow = {
  id: string;
  email: string;
};

const databaseUrl = process.env.DATABASE_URL ?? "file:dev.db";
const useSqlite = databaseUrl.startsWith("file:");

let sqliteDatabase: any = null;
let postgresPool: Pool | null = null;

function getSqliteDatabase() {
  if (!sqliteDatabase) {
    const dbPath = path.join(process.cwd(), "dev.db");
    sqliteDatabase = new Database(dbPath);
    sqliteDatabase.pragma("foreign_keys = ON");
    sqliteDatabase.pragma("journal_mode = WAL");
  }

  return sqliteDatabase;
}

function getPostgresPool() {
  if (!postgresPool) {
    postgresPool = new Pool({
      connectionString: databaseUrl,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }

  return postgresPool;
}

function logSqliteError(action: string, auditId: string, error: unknown) {
  console.error(`Audit ${action} failed for ${auditId}:`, error);
}

function normalizeAuditRow(row: Record<string, unknown>): AuditRow {
  return {
    id: String(row.id),
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
    totalMonthlySpend: Number(row.totalMonthlySpend),
    totalMonthlySavings: Number(row.totalMonthlySavings),
    totalAnnualSavings: Number(row.totalAnnualSavings),
    overallEfficiencyScore: Number(row.overallEfficiencyScore),
    savingsCategory: String(row.savingsCategory),
    aiSummary:
      row.aiSummary === null || row.aiSummary === undefined
        ? null
        : String(row.aiSummary),
    itemsData: String(row.itemsData),
  };
}

function normalizeLeadRow(row: Record<string, unknown>): LeadRow {
  return {
    id: String(row.id),
    email: String(row.email),
  };
}

export async function getAuditRowById(auditId: string): Promise<{
  audit: AuditRow | null;
  unavailable: boolean;
}> {
  try {
    if (useSqlite) {
      const audit = getSqliteDatabase()
        .prepare(
          `
            SELECT
              id,
              createdAt,
              totalMonthlySpend,
              totalMonthlySavings,
              totalAnnualSavings,
              overallEfficiencyScore,
              savingsCategory,
              aiSummary,
              itemsData
            FROM Audit
            WHERE id = ?
          `
        )
        .get(auditId) as Record<string, unknown> | undefined;

      return { audit: audit ? normalizeAuditRow(audit) : null, unavailable: false };
    }

    const result = await getPostgresPool().query(
      `
        SELECT
          "id",
          "createdAt",
          "totalMonthlySpend",
          "totalMonthlySavings",
          "totalAnnualSavings",
          "overallEfficiencyScore",
          "savingsCategory",
          "aiSummary",
          "itemsData"
        FROM "Audit"
        WHERE "id" = $1
      `,
      [auditId]
    );

    const audit = result.rows[0] as Record<string, unknown> | undefined;
    return { audit: audit ? normalizeAuditRow(audit) : null, unavailable: false };
  } catch (error) {
    logSqliteError("lookup", auditId, error);
    return { audit: null, unavailable: true };
  }
}

export async function saveAuditResult(
  auditResult: AuditResult,
  lead?: { email: string; teamSize?: string | null }
): Promise<boolean> {
  try {
    if (useSqlite) {
      const databaseConnection = getSqliteDatabase();

      const insertAudit = databaseConnection.prepare(`
        INSERT INTO Audit (
          id,
          totalMonthlySpend,
          totalMonthlySavings,
          totalAnnualSavings,
          overallEfficiencyScore,
          savingsCategory,
          aiSummary,
          itemsData
        ) VALUES (
          @id,
          @totalMonthlySpend,
          @totalMonthlySavings,
          @totalAnnualSavings,
          @overallEfficiencyScore,
          @savingsCategory,
          @aiSummary,
          @itemsData
        )
        ON CONFLICT(id) DO UPDATE SET
          totalMonthlySpend = excluded.totalMonthlySpend,
          totalMonthlySavings = excluded.totalMonthlySavings,
          totalAnnualSavings = excluded.totalAnnualSavings,
          overallEfficiencyScore = excluded.overallEfficiencyScore,
          savingsCategory = excluded.savingsCategory,
          aiSummary = excluded.aiSummary,
          itemsData = excluded.itemsData
      `);

      insertAudit.run({
        id: auditResult.id,
        totalMonthlySpend: auditResult.totalMonthlySpend,
        totalMonthlySavings: auditResult.totalMonthlySavings,
        totalAnnualSavings: auditResult.totalAnnualSavings,
        overallEfficiencyScore: auditResult.overallEfficiencyScore,
        savingsCategory: auditResult.savingsCategory,
        aiSummary: auditResult.aiSummary ?? null,
        itemsData: JSON.stringify(auditResult.items),
      });
    } else {
      await getPostgresPool().query(
        `
          INSERT INTO "Audit" (
            "id",
            "createdAt",
            "totalMonthlySpend",
            "totalMonthlySavings",
            "totalAnnualSavings",
            "overallEfficiencyScore",
            "savingsCategory",
            "aiSummary",
            "itemsData"
          ) VALUES (
            $1,
            NOW(),
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8
          )
          ON CONFLICT ("id") DO UPDATE SET
            "totalMonthlySpend" = EXCLUDED."totalMonthlySpend",
            "totalMonthlySavings" = EXCLUDED."totalMonthlySavings",
            "totalAnnualSavings" = EXCLUDED."totalAnnualSavings",
            "overallEfficiencyScore" = EXCLUDED."overallEfficiencyScore",
            "savingsCategory" = EXCLUDED."savingsCategory",
            "aiSummary" = EXCLUDED."aiSummary",
            "itemsData" = EXCLUDED."itemsData"
        `,
        [
          auditResult.id,
          auditResult.totalMonthlySpend,
          auditResult.totalMonthlySavings,
          auditResult.totalAnnualSavings,
          auditResult.overallEfficiencyScore,
          auditResult.savingsCategory,
          auditResult.aiSummary ?? null,
          JSON.stringify(auditResult.items),
        ]
      );
    }

    if (lead) {
      const leadSaved = await saveLeadForAudit(
        auditResult.id,
        lead.email,
        lead.teamSize ?? null
      );

      if (!leadSaved) {
        console.error(`Lead save failed for ${auditResult.id}`);
      }
    }

    return true;
  } catch (error) {
    logSqliteError("save", auditResult.id, error);
    return false;
  }
}

export async function saveLeadForAudit(
  auditId: string,
  email: string,
  teamSize?: string | null
): Promise<LeadRow | null> {
  try {
    if (useSqlite) {
      const databaseConnection = getSqliteDatabase();
      const leadId = randomUUID();

      const insertLead = databaseConnection.prepare(`
        INSERT INTO Lead (
          id,
          email,
          teamSize,
          createdAt,
          updatedAt,
          auditId
        ) VALUES (
          @id,
          @email,
          @teamSize,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP,
          @auditId
        )
        ON CONFLICT(auditId) DO UPDATE SET
          email = excluded.email,
          teamSize = excluded.teamSize,
          updatedAt = CURRENT_TIMESTAMP
      `);

      insertLead.run({
        id: leadId,
        email,
        teamSize: teamSize ?? null,
        auditId,
      });

      const lead = databaseConnection
        .prepare(
          `
            SELECT id, email
            FROM Lead
            WHERE auditId = ?
          `
        )
        .get(auditId) as Record<string, unknown> | undefined;

      return lead ? normalizeLeadRow(lead) : null;
    }

    const result = await getPostgresPool().query(
      `
        INSERT INTO "Lead" (
          "id",
          "email",
          "teamSize",
          "createdAt",
          "updatedAt",
          "auditId"
        ) VALUES (
          $1,
          $2,
          $3,
          NOW(),
          NOW(),
          $4
        )
        ON CONFLICT ("auditId") DO UPDATE SET
          "email" = EXCLUDED."email",
          "teamSize" = EXCLUDED."teamSize",
          "updatedAt" = NOW()
        RETURNING "id", "email"
      `,
      [randomUUID(), email, teamSize ?? null, auditId]
    );

    const lead = result.rows[0] as Record<string, unknown> | undefined;
    return lead ? normalizeLeadRow(lead) : null;
  } catch (error) {
    logSqliteError("lead save", auditId, error);
    return null;
  }
}
