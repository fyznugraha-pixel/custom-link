import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import AdminDashboardClient from '@/components/AdminDashboardClient';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'fyznugraha@gmail.com';

export default async function AdminPage() {
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
  }));

  const stats = {
    totalUsers: users.length,
    onlineUsers,
    totalLinks,
    totalClicks
  };

  return (
    <div className="w-full px-6 sm:px-10 lg:px-16 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Super Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage all platform data, users, and links.</p>
        </div>
      </div>
      
      <AdminDashboardClient 
        stats={stats} 
        users={serializedUsers} 
        links={serializedLinks} 
        customDomains={customDomains} 
      />
    </div>
  );
}
