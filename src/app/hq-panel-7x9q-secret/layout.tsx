import AdminSidebar from '@/components/AdminSidebar';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== 'fyznugraha@gmail.com') {
    redirect('/login');
  }
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Suspense fallback={null}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 flex flex-col w-full min-w-0 pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
