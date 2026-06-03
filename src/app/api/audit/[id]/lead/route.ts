import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getAuditById } from '@/lib/audit-store';
import { captureLeadRequestSchema } from '@/lib/validation/audit';
import { saveLeadForAudit } from '@/lib/sqlite';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const parsed = captureLeadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid lead capture payload',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { audit, unavailable } = await getAuditById(id);

    if (!audit) {
      return NextResponse.json(
        {
          success: false,
          error: unavailable
            ? 'Audit storage is temporarily unavailable'
            : 'Audit not found',
        },
        { status: unavailable ? 503 : 404 }
      );
    }

    const lead = await saveLeadForAudit(
      id,
      parsed.data.email,
      parsed.data.teamSize ?? null
    );

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Failed to capture lead' },
        { status: 500 }
      );
    }

    const resend = getResendClient();
    if (resend) {
      try {
        void resend.emails
          .send({
            from: 'TrackSpend AI <audits@trackspend.ai>',
            to: [lead.email],
            subject: `Your AI Spend Audit Results (${audit.overallEfficiencyScore}/100 Efficiency)`,
            html: `
              <h1>Your AI Tooling Audit is Ready</h1>
              <p>We found <strong>$${audit.totalAnnualSavings}</strong> in potential annual savings.</p>
              <p>View your full interactive report here: <a href="http://localhost:3000/audit/${audit.id}">View Report</a></p>
              <p>TrackSpend AI will prioritize follow-up when audits show large savings opportunities.</p>
            `,
          })
          .catch((error) => console.error('Lead email send failed:', error));
      } catch (error) {
        console.error('Lead email send failed:', error);
      }
    }

    return NextResponse.json({ success: true, data: { id: lead.id } });
  } catch (error) {
    console.error('Lead capture failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to capture lead' }, { status: 500 });
  }
}
