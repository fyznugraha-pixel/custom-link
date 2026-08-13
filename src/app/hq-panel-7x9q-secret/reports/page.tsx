import prisma from '@/lib/prisma';
import ReportTableClient from './ReportTableClient';

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="w-full px-6 sm:px-10 lg:px-16 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Reports Management
        </h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">
          Review and resolve abuse/spam reports submitted by users.
        </p>
      </div>

      <ReportTableClient initialReports={reports} />
    </div>
  );
}
