import { ImageResponse } from 'next/og';
import { getAuditById } from '@/lib/audit-store';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { audit } = await getAuditById(id);

  const monthlySavings = audit?.totalMonthlySavings ?? 0;
  const annualSavings = audit?.totalAnnualSavings ?? 0;
  const score = audit?.overallEfficiencyScore ?? 100;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#050505',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          fontFamily: 'Arial',
        }}
      >
        <div style={{ fontSize: 30, color: '#60a5fa', marginBottom: 28 }}>TrackSpend AI AI Spend Audit</div>
        <div style={{ fontSize: 94, fontWeight: 800, lineHeight: 1 }}>
          {formatCurrency(monthlySavings)}/mo
        </div>
        <div style={{ fontSize: 34, color: '#d4d4d8', marginTop: 24 }}>
          {formatCurrency(annualSavings)} annual savings identified
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            fontSize: 26,
            color: '#a1a1aa',
          }}
        >
          Efficiency score: {score}/100
        </div>
      </div>
    ),
    size
  );
}
