import AdminSidebar from '@/components/AdminSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 flex flex-col w-full min-w-0 pt-16 md:pt-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
