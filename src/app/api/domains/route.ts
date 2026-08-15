import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.email === 'fyznugraha@gmail.com';

    let userIds = ['admin-system']; // Always include system domains for public use

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        userIds.push(user.id);
      }
    }

    // If an admin requests this API, they still get system domains
    const domains = await prisma.customDomain.findMany({
      where: {
        userId: { in: userIds }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ success: true, data: domains });
  } catch (error: any) {
    console.error('Fetch domains error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId = null;
    let userName = null;
    const isAdmin = session.user?.email === 'fyznugraha@gmail.com';

    if (isAdmin) {
      userId = 'admin-system';
      userName = 'System Admin';
    } else if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        userId = user.id;
        userName = user.name || 'User';
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const { domain } = body;
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Basic domain validation
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    const cleanDomain = domain.toLowerCase().trim();

    // Check if domain exists
    const existing = await prisma.customDomain.findUnique({
      where: { domain: cleanDomain }
    });

    if (existing) {
      return NextResponse.json({ error: 'Domain already registered' }, { status: 400 });
    }

    const customDomain = await prisma.customDomain.create({
      data: {
        domain: cleanDomain,
        status: 'pending',
        user: {
          connectOrCreate: {
            where: { id: userId },
            create: { id: userId, name: userName || 'Unknown' }
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: customDomain }, { status: 201 });
  } catch (error: any) {
    console.error('Create domain error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
