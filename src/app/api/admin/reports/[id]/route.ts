import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Helper to check admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  
  // Note: we can either rely on session admin flag if it exists, or just check the admin password logic used elsewhere
  // We'll import cookies and check the 'admin_token'
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('admin_token');
  
  if (!adminCookie || adminCookie.value !== 'true') return false;
  
  return true;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();

    if (!['pending', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const resolvedParams = await params;
    const updatedReport = await prisma.report.update({
      where: { id: resolvedParams.id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updatedReport });
  } catch (error: any) {
    console.error('Update report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    await prisma.report.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
