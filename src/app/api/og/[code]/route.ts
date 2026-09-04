import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    
    // Check if domain is custom (from host header)
    const hostname = request.headers.get('host') || '';
    const cleanHostname = hostname.split(':')[0];
    
    let domainId: string | undefined = undefined;
    
    // Only lookup custom domain if it's not the primary domain
    if (cleanHostname && !cleanHostname.includes('fyurl.id') && !cleanHostname.includes('localhost')) {
      const customDomain = await prisma.customDomain.findUnique({
        where: { domain: cleanHostname }
      });
      if (customDomain) {
        domainId = customDomain.id;
      }
    }

    // Find the link
    const link = await prisma.link.findFirst({
      where: {
        shortCode: code,
        domainId: domainId || null,
      },
      select: { ogImage: true }
    });

    if (!link || !link.ogImage) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // ogImage is stored as data:image/png;base64,....
    const matches = link.ogImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return new NextResponse('Invalid image data', { status: 400 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error serving OG image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
