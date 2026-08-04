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
    const cacheData = await redis.get<any>(cacheKey);

    if (cacheData) {
      if (typeof cacheData === 'object') {
        if (cacheData.locked || cacheData.isProtected) {
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set('x-domain', cleanHostname);
          if (cacheData.unlockAt) requestHeaders.set('x-unlock-at', cacheData.unlockAt);
          if (cacheData.hasPassword || cacheData.isProtected) requestHeaders.set('x-has-password', 'true');
          if (cacheData.title) requestHeaders.set('x-title', cacheData.title);

          return NextResponse.rewrite(new URL(`/unlock/${shortCode}`, request.url), {
            request: { headers: requestHeaders },
          });
        }
      } else if (typeof cacheData === 'string') {
        if (cacheData === 'PROTECTED') {
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set('x-domain', cleanHostname);
          requestHeaders.set('x-has-password', 'true');
          return NextResponse.rewrite(new URL(`/unlock/${shortCode}`, request.url), {
            request: { headers: requestHeaders },
          });
        } else if (cacheData.startsWith('{')) {
          try {
            const parsed = JSON.parse(cacheData);
            if (parsed.locked) {
              const requestHeaders = new Headers(request.headers);
              requestHeaders.set('x-domain', cleanHostname);
              if (parsed.unlockAt) requestHeaders.set('x-unlock-at', parsed.unlockAt);
              if (parsed.hasPassword) requestHeaders.set('x-has-password', 'true');
              if (parsed.title) requestHeaders.set('x-title', parsed.title);

              return NextResponse.rewrite(new URL(`/unlock/${shortCode}`, request.url), {
                request: { headers: requestHeaders },
              });
            }
          } catch (e) {}
        }
      }

      // CACHE HIT -> Redirect
      // If cacheData is an object, longUrl might be inside it, or it might just be the longUrl string.
      const longUrl = typeof cacheData === 'string' ? cacheData : (cacheData.longUrl || null);
      
      if (longUrl) {
        // 3. Async click logging
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
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set('x-domain', cleanHostname);
          if (data.unlockAt) requestHeaders.set('x-unlock-at', data.unlockAt);
          if (data.hasPassword || data.isProtected) requestHeaders.set('x-has-password', 'true');
          if (data.title) requestHeaders.set('x-title', data.title);

          return NextResponse.rewrite(new URL(`/unlock/${shortCode}`, request.url), {
            request: { headers: requestHeaders },
          });
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
