import type { Metadata } from 'next';
import { getPrismaClient } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

type AuditLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: AuditLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const prisma = getPrismaClient();
  const audit = await prisma.audit.findUnique({
    where: { id },
  });

  if (!audit) {
    return {
      title: 'TrackSpend AI Audit Results',
      description: 'AI spend audit results from TrackSpend AI.',
    };
  }

  const title = `${formatCurrency(audit.totalMonthlySavings)}/mo AI savings found`;
  const description = `${formatCurrency(audit.totalAnnualSavings)}/yr potential savings with a ${audit.overallEfficiencyScore}/100 efficiency score.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/audit/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function AuditLayout({ children }: AuditLayoutProps) {
  return children;
}
