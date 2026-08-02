import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe, Smartphone, MousePointer2, Calendar } from 'lucide-react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }

  const { id: linkId } = await params;
  
  const link = await prisma.link.findUnique({
    where: { id: linkId },
    include: { domain: true },
  });

  if (!link || link.userId !== session.user?.id) notFound();

  // Aggregate clicks
  const clicks = await prisma.clickEvent.findMany({
    where: { linkId },
    orderBy: { createdAt: 'desc' },
  });

  type LogEvent = { id: string; device: string | null; referrer: string | null; country: string | null; createdAt: Date };

  // Calculate aggregates
  const devices = clicks.reduce((acc: Record<string, number>, curr: LogEvent) => {
    acc[curr.device || 'Unknown'] = (acc[curr.device || 'Unknown'] || 0) + 1;
    return acc;
  }, {});

  const referrers = clicks.reduce((acc: Record<string, number>, curr: LogEvent) => {
    // Simplify referrer URL to just hostname if possible
    let ref = curr.referrer || 'Direct / None';
    try {
      if (ref !== 'Direct / None') ref = new URL(ref).hostname;
    } catch (e) {}
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {});

  const countries = clicks.reduce((acc: Record<string, number>, curr: LogEvent) => {
    const c = curr.country || 'Unknown';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Links
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">/{link.shortCode}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-sm text-muted-foreground truncate max-w-md" title={link.longUrl}>{link.longUrl}</span>
            </div>
          </div>
          <div className="bg-white px-6 py-4 rounded-xl border border-border shadow-sm text-right">
            <p className="text-sm text-muted-foreground font-medium">Total Clicks</p>
            <p className="text-4xl font-bold text-foreground">{link.clicks.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Device Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-foreground flex items-center mb-6">
            <Smartphone className="w-5 h-5 mr-2 text-primary-500" />
            Devices
          </h3>
          <div className="space-y-4 flex-1">
            {Object.entries(devices).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No data yet</p>
            ) : (
              (Object.entries(devices) as [string, number][]).sort((a,b) => b[1] - a[1]).map(([device, count]) => (
                <div key={device} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">{device}</span>
                  <span className="text-sm font-bold text-foreground">{count} <span className="text-xs font-normal text-muted-foreground ml-1">({Math.round(count / link.clicks * 100)}%)</span></span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Referrers */}
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-foreground flex items-center mb-6">
            <MousePointer2 className="w-5 h-5 mr-2 text-primary-500" />
            Referrers
          </h3>
          <div className="space-y-4 flex-1">
            {Object.entries(referrers).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No data yet</p>
            ) : (
              (Object.entries(referrers) as [string, number][]).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([ref, count]) => (
                <div key={ref} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground truncate max-w-[150px]" title={ref}>{ref}</span>
                  <span className="text-sm font-bold text-foreground">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Locations */}
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-foreground flex items-center mb-6">
            <Globe className="w-5 h-5 mr-2 text-primary-500" />
            Locations
          </h3>
          <div className="space-y-4 flex-1">
            {Object.entries(countries).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No data yet</p>
            ) : (
              (Object.entries(countries) as [string, number][]).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([country, count]) => (
                <div key={country} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">{country}</span>
                  <span className="text-sm font-bold text-foreground">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Recent Clicks Feed */}
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm lg:col-span-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center mb-6">
            <Calendar className="w-5 h-5 mr-2 text-primary-500" />
            Recent Activity
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Device</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Referrer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clicks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No clicks recorded yet.</td>
                  </tr>
                ) : (
                  clicks.slice(0, 10).map((click: LogEvent) => (
                    <tr key={click.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                        {new Date(click.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{click.device || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{click.country || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground truncate max-w-[200px]" title={click.referrer || 'Direct'}>
                        {click.referrer || 'Direct'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
