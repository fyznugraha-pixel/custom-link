import prisma from '@/lib/prisma';
import Link from 'next/link';
import { BarChart3, Link as LinkIcon, ExternalLink, MousePointer2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GlobalAnalyticsPage() {
  // Aggregate data
  const [totalLinks, links, clicksData] = await Promise.all([
    prisma.link.count(),
    prisma.link.findMany({
      orderBy: { clicks: 'desc' },
      take: 10,
      include: { domain: true }
    }),
    prisma.clickEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { link: { include: { domain: true } } }
    })
  ]);

  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);

  return (
    <div className="w-full px-6 sm:px-10 lg:px-16 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Global Analytics</h1>
        <p className="mt-2 text-sm text-muted-foreground">Overview of all shortened links and traffic across the platform.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-10">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex items-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-primary-100 rounded-xl flex items-center justify-center mr-4 sm:mr-6">
            <LinkIcon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1 truncate">Total Links Created</p>
            <p className="text-2xl sm:text-4xl font-bold text-foreground truncate">{totalLinks.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex items-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-green-100 rounded-xl flex items-center justify-center mr-4 sm:mr-6">
            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1 truncate">Total Clicks</p>
            <p className="text-2xl sm:text-4xl font-bold text-foreground truncate">{totalClicks.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Links */}
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h2 className="font-bold text-foreground flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
              Top 10 Most Clicked Links
            </h2>
          </div>
          <div className="overflow-y-auto flex-1">
            <ul className="divide-y divide-border">
              {links.length === 0 ? (
                <li className="p-6 text-center text-muted-foreground">No links available yet.</li>
              ) : (
                links.map((link) => (
                  <li key={link.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start gap-3 sm:gap-4">
                      <div className="overflow-hidden flex-1 min-w-0">
                        <Link href={`/admin/analytics/${link.id}`} className="font-semibold text-primary-600 hover:underline block truncate text-sm mb-1">
                          {link.domain?.domain || 'fyurl.id'}/{link.shortCode}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">{link.longUrl}</p>
                      </div>
                      <div className="bg-primary-50 text-primary-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex items-center shrink-0">
                        {link.clicks.toLocaleString()} <span className="hidden sm:inline text-xs font-normal ml-1">clicks</span>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h2 className="font-bold text-foreground flex items-center">
              <MousePointer2 className="w-5 h-5 mr-2 text-primary-600" />
              Recent Click Activity
            </h2>
          </div>
          <div className="overflow-y-auto flex-1">
            <ul className="divide-y divide-border">
              {clicksData.length === 0 ? (
                <li className="p-6 text-center text-muted-foreground">No recent clicks recorded yet.</li>
              ) : (
                clicksData.map((click) => (
                  <li key={click.id} className="p-4 text-sm hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className="font-medium text-foreground truncate min-w-0">
                        {click.link.domain?.domain || 'fyurl.id'}/{click.link.shortCode}
                      </span>
                      <span className="text-muted-foreground text-[10px] sm:text-xs shrink-0 whitespace-nowrap pt-0.5">
                        {new Date(click.createdAt).toLocaleString(undefined, { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-4 flex-wrap">
                      <span><span className="font-medium text-foreground">Device:</span> {click.device || 'Unknown'}</span>
                      <span><span className="font-medium text-foreground">Country:</span> {click.country || 'Unknown'}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
