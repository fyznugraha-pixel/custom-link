import prisma from '@/lib/prisma';
import DomainTableClient from '@/components/DomainTableClient';

export const dynamic = 'force-dynamic';

export default async function DomainsPage() {
  const domains = await prisma.customDomain.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const serializedDomains = domains.map(d => ({
    ...d,
    createdAt: d.createdAt.toISOString()
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-300">
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
