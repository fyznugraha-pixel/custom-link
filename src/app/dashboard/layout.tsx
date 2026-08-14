import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserNavbar from "@/components/UserNavbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  if (session?.user?.email === 'fyznugraha@gmail.com') {
    redirect('/hq-panel-7x9q-secret');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <UserNavbar user={session.user} />
      <main className="flex-1 w-full pt-16 pb-16 sm:pb-0">
        {children}
      </main>
    </div>
  );
}
