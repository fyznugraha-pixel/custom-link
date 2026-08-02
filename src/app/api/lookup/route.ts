import { NextResponse } from 'next/server';
import { LinkRepository } from '@/repositories/link.repository';
import { redis } from '@/lib/redis';
import prisma from '@/lib/prisma';

// Initialize the repository outside the handler
const linkRepository = new LinkRepository();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain') || '';
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  try {
    let domainId: string | undefined = undefined;
    
    if (domain) {
      const customDomain = await prisma.customDomain.findUnique({
        where: { domain }
      });
      if (customDomain) {
        domainId = customDomain.id;
      }
    }

    // 1. Fetch from DB using the resolved domainId
    const link = await linkRepository.findByShortCode(code, domainId);

    if (link) {
      if (link.expiresAt && link.expiresAt < new Date()) {
        return NextResponse.json({ error: 'Link not found or expired' }, { status: 404 });
      }

      // 2. Set to Redis Cache for future hits (ttl: 1 hour max, or until expiry)
      let ttl = 3600;
      if (link.expiresAt) {
        const secondsUntilExpiry = Math.floor((link.expiresAt.getTime() - Date.now()) / 1000);
        if (secondsUntilExpiry < 3600) {
          ttl = Math.max(1, secondsUntilExpiry);
        }
      }

      const cacheKey = `domain:${domain}:code:${code}`;
      await redis.setex(cacheKey, ttl, link.longUrl);

      return NextResponse.json({ longUrl: link.longUrl });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Lookup API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
