import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || null;

    // Update lastActiveAt for tracking online users
    await prisma.user.update({
      where: { id: userId },
      data: { 
        lastActiveAt: new Date(),
        ...(country ? { country } : {})
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ping error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
