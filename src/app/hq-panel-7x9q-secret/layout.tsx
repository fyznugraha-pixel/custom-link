import AdminSidebar from '@/components/AdminSidebar';
import { Suspense } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
