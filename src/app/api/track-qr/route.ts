import { NextResponse, NextRequest } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { shortUrl } = await request.json();

    // Track silently
    prisma.qrEvent.create({
      data: {
        shortUrl: shortUrl ? shortUrl.substring(0, 190) : null,
      }
    }).catch(e => console.error('Silent QR track err:', e));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('QR Track error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
