import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        domain: true,
      }
    });

    return NextResponse.json({ success: true, data: links });
  } catch (error: any) {
    console.error('List Links Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch links' }, { status: 500 });
  }
}
