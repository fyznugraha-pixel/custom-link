import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { shortCode, domain, password } = await request.json();

    if (!shortCode) {
      return NextResponse.json({ success: false, error: 'Missing shortCode' }, { status: 400 });
    }

    let domainId = null;
    if (domain) {
      const customDomain = await prisma.customDomain.findUnique({
        where: { domain }
      });
      if (customDomain) domainId = customDomain.id;
    }

    const link = await prisma.link.findFirst({
      where: {
        shortCode,
        domainId
      }
    });

    if (!link) {
      return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 });
    }

    if (link.unlockAt && link.unlockAt > new Date()) {
      return NextResponse.json({ success: false, error: 'Link is still locked' }, { status: 403 });
    }

    if (link.password) {
      if (!password) {
        return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 });
      }
      const isValid = await bcrypt.compare(password, link.password);
      
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
      }
    }

    return NextResponse.json({ success: true, longUrl: link.longUrl });
  } catch (error) {
    console.error('Verify password error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
