import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redis } from '@/lib/redis';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // Skip standard Next.js paths and API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname === '/' ||
    url.pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // The short code is the pathname without the leading slash
  const shortCode = url.pathname.slice(1);
  const hostname = request.headers.get('host') || '';
  
  // Clean hostname (remove port if local)
  const cleanHostname = hostname.split(':')[0];

  try {
    // 1. Redis Lookup Cache
    // Cache key format: domain:{domain}:code:{shortCode}
    const cacheKey = `domain:${cleanHostname}:code:${shortCode}`;
    const longUrl = await redis.get<string>(cacheKey);

    if (longUrl) {
      // CACHE HIT -> Redirect
      return NextResponse.redirect(new URL(longUrl), { status: 301 });
    }

    // 2. DB Fallback (Cache Miss)
    // Since Edge middleware cannot easily query Postgres with standard Prisma,
    // we query our own internal API route to handle the DB lookup and Redis Cache SET.
    const res = await fetch(`${url.origin}/api/lookup?domain=${cleanHostname}&code=${shortCode}`);
    if (res.ok) {
      const data = await res.json();
      if (data.longUrl) {
        return NextResponse.redirect(new URL(data.longUrl), { status: 301 });
      }
    }

    // Not found
    return NextResponse.rewrite(new URL('/404', request.url));
  } catch (error) {
    console.error('Middleware Error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|dashboard).*)',
  ],
};
