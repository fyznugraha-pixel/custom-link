import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import AdminDashboardClient from '@/components/AdminDashboardClient';
import { Suspense } from 'react';
import { getStartDate, generateChartData } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'fyznugraha@gmail.com';

type PageProps = {
  searchParams: Promise<{ tab?: string; range?: string }>;
}

export default async function AdminPage(props: PageProps) {
  const resolvedParams = await props.searchParams;
  const range = resolvedParams?.range || '7d';
  
  const session = await getServerSession(authOptions);
  
  // Strict Auth Check
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    redirect('/'); // Kick unauthorized users out
  }

  // 1. Fetch Links & Clicks
  const links = await prisma.link.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      domain: true,
    }
  });

  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);

  // 2. Fetch Users Data
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      lastActiveAt: true,
      country: true,
    }
  });

  // Calculate online users (active in the last 15 minutes)
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
  const onlineUsers = users.filter(user => user.lastActiveAt && user.lastActiveAt > fifteenMinsAgo).length;

  const customDomains = await prisma.customDomain.findMany({
    where: { status: 'verified' },
    orderBy: { domain: 'asc' }
  });

  // Serialize dates
  const serializedLinks = links.map((link: { createdAt: Date; expiresAt: Date | null; [key: string]: any }) => ({
    ...link,
    createdAt: link.createdAt.toISOString(),
    expiresAt: link.expiresAt?.toISOString() || null,
  }));

  const serializedUsers = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    lastActiveAt: user.lastActiveAt?.toISOString() || null,
    country: user.country || 'Unknown',
  }));

  const stats = {
    totalUsers: users.length,
    onlineUsers,
    totalLinks,
    totalClicks
  };

  // 3. Analytics Growth Data
  const startDate = getStartDate(range);
  const clickEvents = await prisma.clickEvent.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true }
  });
  const pageViews = await prisma.pageView.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true }
  });
  const qrEvents = await prisma.qrEvent.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true }
  });

  const activeUsersData = users.filter(u => u.lastActiveAt).map(u => ({ lastActiveAt: u.lastActiveAt }));
  
  const chartData = generateChartData(
    range,
    startDate,
    users, // users with createdAt
    links, // links with createdAt
    clickEvents,
    activeUsersData,
    pageViews,
    qrEvents
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Super Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage all platform data, users, and links.</p>
        </div>
      </div>
      
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading dashboard...</div>}>
        <AdminDashboardClient 
          stats={stats} 
          users={serializedUsers} 
          links={serializedLinks} 
          customDomains={customDomains} 
          chartData={chartData}
          currentRange={range}
        />
      </Suspense>
    </div>
  );
}
