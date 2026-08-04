import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redis } from '@/lib/redis';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // 1. Admin Protection Logic
  const isAdminPath = url.pathname.startsWith('/dashboard') && url.pathname !== '/dashboard/login';
  const isProtectedApi = url.pathname.startsWith('/api/domains') || url.pathname.match(/^\/api\/links\/[^\/]+$/);

  if (isAdminPath || isProtectedApi) {
    const adminToken = request.cookies.get('admin_token');
    if (!adminToken || adminToken.value !== 'true') {
      if (isAdminPath) {
        return NextResponse.redirect(new URL('/dashboard/login', request.url));
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  // 2. Skip standard Next.js paths and API routes for short code logic
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/logo') ||
    url.pathname.startsWith('/report') ||
    url.pathname.startsWith('/unlock') ||
    url.pathname === '/' ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/icon.png' ||
    url.pathname === '/sw.js'
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
    const cacheData = await redis.get<string>(cacheKey);

    if (cacheData) {
      if (cacheData.startsWith('{')) {
        try {
          const parsed = JSON.parse(cacheData);
          if (parsed.locked) {
            const unlockAtStr = parsed.unlockAt ? `&unlockAt=${encodeURIComponent(parsed.unlockAt)}` : '';
            const hasPwdStr = parsed.hasPassword ? `&hasPassword=true` : '';
            const titleStr = parsed.title ? `&title=${encodeURIComponent(parsed.title)}` : '';
            return NextResponse.rewrite(new URL(`/unlock/${shortCode}?domain=${cleanHostname}${unlockAtStr}${hasPwdStr}${titleStr}`, request.url));
          }
        } catch (e) {
          // ignore parsing error and continue
        }
      } else if (cacheData === 'PROTECTED') {
        return NextResponse.rewrite(new URL(`/unlock/${shortCode}?domain=${cleanHostname}&hasPassword=true`, request.url));
      }

      // CACHE HIT -> Redirect
      const longUrl = cacheData;
      // 3. Async click logging
      // Fire and forget via waitUntil (Vercel Edge support)
      // Note: request.waitUntil is available in Edge Middleware, but we can also just use standard fetch without awaiting.
      // NextFetchEvent can be passed if we export middleware properly, but fire-and-forget fetch usually works on Vercel too.
      fetch(`${url.origin}/api/log-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortCode,
          domain: cleanHostname,
          referrer: request.headers.get('referer') || '',
          userAgent: request.headers.get('user-agent') || '',
          ip: request.headers.get('x-forwarded-for') || '',
          country: request.headers.get('x-vercel-ip-country') || '',
        }),
      }).catch(console.error);

      return NextResponse.redirect(new URL(longUrl), { status: 301 });
    }

    // 2. DB Fallback (Cache Miss)
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${hostname}`;
    const fetchUrl = `${baseUrl}/api/lookup?domain=${cleanHostname}&code=${shortCode}`;
    
    try {
      const res = await fetch(fetchUrl);
      if (res.ok) {
        const data = await res.json();
        
        if (data.locked || data.isProtected) {
          const unlockAtStr = data.unlockAt ? `&unlockAt=${encodeURIComponent(data.unlockAt)}` : '';
          const hasPwdStr = (data.hasPassword || data.isProtected) ? `&hasPassword=true` : '';
          const titleStr = data.title ? `&title=${encodeURIComponent(data.title)}` : '';
          return NextResponse.rewrite(new URL(`/unlock/${shortCode}?domain=${cleanHostname}${unlockAtStr}${hasPwdStr}${titleStr}`, request.url));
        }

        if (data.longUrl) {
          // Async click log
          fetch(`${baseUrl}/api/log-click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               shortCode, 
               domain: cleanHostname, 
               referrer: request.headers.get('referer') || '',
               userAgent: request.headers.get('user-agent') || '', 
               ip: request.headers.get('x-forwarded-for') || '',
               country: request.headers.get('x-vercel-ip-country') || ''
            })
          }).catch(console.error);

          return NextResponse.redirect(new URL(data.longUrl), { status: 301 });
        }
      } else {
        const text = await res.text();
        return NextResponse.redirect(new URL(`/?error=lookup_failed&status=${res.status}&msg=${encodeURIComponent(text.substring(0,50))}`, request.url));
      }
    } catch (e: any) {
      return NextResponse.redirect(new URL(`/?error=fetch_exception&msg=${encodeURIComponent(e.message)}`, request.url));
    }

    // Not found
    return NextResponse.rewrite(new URL('/404', request.url));
  } catch (error: any) {
    console.error('Middleware Error:', error);
    return NextResponse.redirect(new URL(`/?error=middleware_exception&msg=${encodeURIComponent(error.message)}`, request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|logo|sw.js).*)',
  ],
};
