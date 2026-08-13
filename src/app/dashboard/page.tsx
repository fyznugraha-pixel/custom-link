import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import LinkTableClient from '@/components/LinkTableClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect('/api/auth/signin');
  }

  // If the admin lands here (e.g. via Google Login callback), redirect to the secret panel
  if (session?.user?.email === 'fyznugraha@gmail.com') {
    redirect('/hq-panel-7x9q-secret');
  }

  // Fetch only the links for the logged-in user
  const links = await prisma.link.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      domain: true,
    }
  });

  const customDomains = await prisma.customDomain.findMany({
    where: { status: 'verified' }, // Or filter by userId if domains are user-specific
    orderBy: { domain: 'asc' }
  });

  // Serialize dates to pass to client component safely
  const serializedLinks = links.map((link: { createdAt: Date; expiresAt: Date | null; [key: string]: any }) => ({
    ...link,
    createdAt: link.createdAt.toISOString(),
    expiresAt: link.expiresAt?.toISOString() || null,
  }));

  return (
    <div className="w-full px-6 sm:px-10 lg:px-16 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Links</h1>
          <p className="text-muted-foreground mt-1">Manage your shortened URLs and view analytics.</p>
        </div>
      </div>
      
      <LinkTableClient initialLinks={serializedLinks} customDomains={customDomains} basePath="/dashboard" />
    </div>
  );
}
