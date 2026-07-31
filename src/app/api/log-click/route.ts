import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { LinkRepository } from '@/repositories/link.repository';

const linkRepository = new LinkRepository();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shortCode, domain, referrer, userAgent, ip, country } = body;

    if (!shortCode) {
      return NextResponse.json({ error: 'Missing shortCode' }, { status: 400 });
    }

    // Find the link ID to attach the click event to
    const link = await linkRepository.findByShortCode(shortCode);
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Parse device from userAgent (simple implementation)
    let device = 'Desktop';
    if (userAgent) {
      if (/mobile/i.test(userAgent)) device = 'Mobile';
      else if (/tablet/i.test(userAgent)) device = 'Tablet';
    }

    // Execute in a transaction: log the click AND increment the counter
    await prisma.$transaction([
      prisma.clickEvent.create({
        data: {
          linkId: link.id,
          referrer: referrer || null,
          device,
          country: country || null,
        }
      }),
      prisma.link.update({
        where: { id: link.id },
        data: { clicks: { increment: 1 } }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log Click API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
