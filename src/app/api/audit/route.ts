import { NextResponse } from 'next/server';
import { runAudit } from '@/lib/engine/audit';
import { generateAuditSummary } from '@/lib/services/ai-summary';
import { getPrismaClient } from '@/lib/db';
import { createAuditRequestSchema } from '@/lib/validation/audit';
import { Resend } from 'resend';

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createAuditRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid audit request payload',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { items, lead } = parsed.data;

    // Run the audit engine
    const auditResult = runAudit(items);

    // Generate AI Summary (non-blocking if we want to stream, but we await here for simplicity)
    const summary = await generateAuditSummary({ auditResult });
    auditResult.aiSummary = summary;

    // Save to Database
    let persisted = true;
    try {
      const prisma = getPrismaClient();
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
        }
      });

      try {
        await prisma.lead.create({
          data: {
            email: lead.email,
            teamSize: lead.teamSize ?? null,
            auditId: auditResult.id,
          },
        });
      } catch (leadError) {
        console.error('Lead capture failed:', leadError);
      }
    } catch (databaseError) {
      persisted = false;
      console.error('Audit persistence failed:', databaseError);
    }

    // Send Email (Fire and forget, don't wait for it to finish)
    const resend = getResendClient();
    if (resend) {
      void resend.emails.send({
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
      data: {
        id: auditResult.id,
        auditResult,
        persisted,
      },
    });
  } catch (error) {
    console.error('Audit generation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate audit' },
      { status: 500 }
    );
  }
}
