import Navbar from '@/components/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full flex flex-col pt-16 pb-16 sm:pb-0">
        {children}
      </main>
    </div>
  );
}
