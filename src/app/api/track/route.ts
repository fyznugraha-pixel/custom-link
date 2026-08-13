import { NextResponse, NextRequest } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    if (!path) return NextResponse.json({ success: false }, { status: 400 });

    const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || null;

    // Track silently
    prisma.pageView.create({
      data: {
        path: path.substring(0, 190), // Prevent too long paths
        country
      }
    }).catch(e => console.error('Silent track err:', e));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
