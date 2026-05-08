import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // Use the imported prisma instance directly
    const audit = await prisma.audit.findUnique({
      where: { id },
    });

    if (!audit) {
      return NextResponse.json({ success: false, error: 'Audit not found' }, { status: 404 });
    }

    const auditResult = {
      id: audit.id,
      createdAt: audit.createdAt.toISOString(),
      totalMonthlySpend: audit.totalMonthlySpend,
      totalMonthlySavings: audit.totalMonthlySavings,
      totalAnnualSavings: audit.totalAnnualSavings,
      overallEfficiencyScore: audit.overallEfficiencyScore,
      savingsCategory: audit.savingsCategory,
      aiSummary: audit.aiSummary,
      items: JSON.parse(audit.itemsData),
    };

    return NextResponse.json({ success: true, data: auditResult });
  } catch (error) {
    console.error('Failed to fetch audit:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch audit' }, { status: 500 });
  }
}
