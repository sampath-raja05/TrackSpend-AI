import Database from "better-sqlite3";
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

const dbPath = path.join(process.cwd(), "dev.db");
let database: any = null;

function getDatabase() {
  if (!database) {
    database = new Database(dbPath);
    database.pragma("foreign_keys = ON");
    database.pragma("journal_mode = WAL");
  }

  return database;
}

function logSqliteError(action: string, auditId: string, error: unknown) {
  console.error(`SQLite ${action} failed for ${auditId}:`, error);
}

export function getAuditRowById(auditId: string): {
  audit: AuditRow | null;
  unavailable: boolean;
} {
  try {
    const audit = getDatabase()
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
      .get(auditId) as AuditRow | undefined;

    return { audit: audit ?? null, unavailable: false };
  } catch (error) {
    logSqliteError("lookup", auditId, error);
    return { audit: null, unavailable: true };
  }
}

export function saveAuditResult(
  auditResult: AuditResult,
  lead?: { email: string; teamSize?: string | null }
): boolean {
  try {
    const databaseConnection = getDatabase();

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

    if (lead) {
      try {
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
          id: randomUUID(),
          email: lead.email,
          teamSize: lead.teamSize ?? null,
          auditId: auditResult.id,
        });
      } catch (leadError) {
        logSqliteError("lead save", auditResult.id, leadError);
      }
    }

    return true;
  } catch (error) {
    logSqliteError("save", auditResult.id, error);
    return false;
  }
}

export function saveLeadForAudit(
  auditId: string,
  email: string,
  teamSize?: string | null
): LeadRow | null {
  try {
    const databaseConnection = getDatabase();
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
      .get(auditId) as LeadRow | undefined;

    return lead ?? null;
  } catch (error) {
    logSqliteError("lead save", auditId, error);
    return null;
  }
}
