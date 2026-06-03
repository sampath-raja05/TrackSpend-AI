import { getAuditRowById } from "@/lib/sqlite";

type AuditRecord = NonNullable<
  Awaited<ReturnType<typeof getAuditRowById>>["audit"]
>;

function logAuditStoreError(action: string, auditId: string, error: unknown) {
  console.error(`Audit ${action} failed for ${auditId}:`, error);
}

export async function getAuditById(auditId: string): Promise<{
  audit: AuditRecord | null;
  unavailable: boolean;
}> {
  const result = await getAuditRowById(auditId);
  if (!result.unavailable) {
    return {
      audit: result.audit,
      unavailable: false,
    };
  }

  logAuditStoreError("lookup", auditId, "SQLite lookup failed");
  return { audit: null, unavailable: true };
}
