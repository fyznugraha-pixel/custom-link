import prisma from '@/lib/prisma';
import LinkTableClient from '@/components/LinkTableClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch data on the server for initial render
  const links = await prisma.link.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      domain: true,
    }
  });

  const customDomains = await prisma.customDomain.findMany({
    where: { status: 'verified' },
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
          <h1 className="text-2xl font-bold text-foreground">Links</h1>
          <p className="text-muted-foreground mt-1">Manage your shortened URLs and view analytics.</p>
        </div>
      </div>
      
      <LinkTableClient initialLinks={serializedLinks} customDomains={customDomains} />
    </div>
  );
}
