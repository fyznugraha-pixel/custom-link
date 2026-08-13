import prisma from '@/lib/prisma';
import DomainTableClient from '@/components/DomainTableClient';

export const dynamic = 'force-dynamic';

export default async function DomainsPage() {
  const domains = await prisma.customDomain.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const serializedDomains = domains.map((d: { id: string; domain: string; status: string; createdAt: Date }) => ({
    ...d,
    createdAt: d.createdAt.toISOString()
  }));

  return (
    <div className="w-full px-6 sm:px-10 lg:px-16 py-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Custom Domains</h1>
          <p className="text-muted-foreground mt-1">Connect your own domain to brand your short links.</p>
        </div>
      </div>
      
      <DomainTableClient initialDomains={serializedDomains} />
    </div>
  );
}
