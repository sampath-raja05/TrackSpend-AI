import { NextResponse } from 'next/server';
import { runAudit } from '@/lib/engine/audit';
import { generateAuditSummary } from '@/lib/services/ai-summary';
import type { SpendItem, LeadData } from '@/lib/types';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, lead } = body as { items: SpendItem[]; lead: Omit<LeadData, 'auditId' | 'totalSavings'> };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No spend items provided' },
        { status: 400 }
      );
    }

    // Run the audit engine
    const auditResult = runAudit(items);

    // Generate AI Summary (non-blocking if we want to stream, but we await here for simplicity)
    const summary = await generateAuditSummary({ auditResult });
    auditResult.aiSummary = summary;

    // Save to Database
    await prisma.audit.create({
      data: {
        id: auditResult.id,
        totalMonthlySpend: auditResult.totalMonthlySpend,
        totalMonthlySavings: auditResult.totalMonthlySavings,
        totalAnnualSavings: auditResult.totalAnnualSavings,
        overallEfficiencyScore: auditResult.overallEfficiencyScore,
        savingsCategory: auditResult.savingsCategory,
        aiSummary: auditResult.aiSummary,
        itemsData: JSON.stringify(auditResult.items),
        lead: {
          create: {
            email: lead.email,
            teamSize: lead.teamSize,
          }
        }
      }
    });

    // Send Email (Fire and forget, don't wait for it to finish)
    if (process.env.RESEND_API_KEY && lead.email) {
      resend.emails.send({
        from: 'Credex <audits@credex.dev>',
        to: [lead.email],
        subject: `Your AI Spend Audit Results (${auditResult.overallEfficiencyScore}/100 Efficiency)`,
        html: `
          <h1>Your AI Tooling Audit is Ready</h1>
          <p>We found <strong>$${auditResult.totalAnnualSavings}</strong> in potential annual savings.</p>
          <p>View your full interactive report here: <a href="http://localhost:3000/audit/${auditResult.id}">View Report</a></p>
          <hr/>
          <p><strong>AI Summary:</strong></p>
          <p>${auditResult.aiSummary}</p>
        `
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      data: { id: auditResult.id },
    });
  } catch (error) {
    console.error('Audit generation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate audit' },
      { status: 500 }
    );
  }
}
