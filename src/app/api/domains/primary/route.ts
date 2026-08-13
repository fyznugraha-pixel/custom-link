import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');
    const isAdmin = adminToken?.value === 'true';

    const session = await getServerSession(authOptions);

    let userId = null;

    if (isAdmin) {
      userId = 'admin-system';
    } else if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domainId } = await req.json();

    if (!domainId) {
      return NextResponse.json({ error: 'Missing domainId' }, { status: 400 });
    }

    // Verify the domain belongs to the user
    const domain = await prisma.customDomain.findFirst({
      where: {
        id: domainId,
        userId: userId,
      },
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found or not owned by user' }, { status: 404 });
    }

    // First, set all user's domains to not primary
    await prisma.customDomain.updateMany({
      where: {
        userId: userId,
      },
      data: {
        isPrimary: false,
      },
    });

    // Then, set the selected domain as primary
    const updatedDomain = await prisma.customDomain.update({
      where: {
        id: domainId,
      },
      data: {
        isPrimary: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedDomain });
  } catch (error: any) {
    console.error('Set primary domain error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
