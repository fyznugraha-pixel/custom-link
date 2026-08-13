import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import ReportTableClient from '@/components/ReportTableClient';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');

  if (!adminToken || adminToken.value !== 'true') {
    redirect('/admin-secret/login');
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="w-full px-6 sm:px-10 lg:px-16 py-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Reported Links</h1>
        <p className="text-muted-foreground mt-1">Manage links that users have reported for abuse or spam.</p>
      </div>

      <ReportTableClient initialReports={reports} />
    </div>
  );
}
