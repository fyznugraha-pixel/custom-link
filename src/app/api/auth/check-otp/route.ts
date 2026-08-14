import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await prisma.otpCode.delete({ where: { id: otpRecord.id } });
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Check if code matches
    if (otpRecord.code !== code) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'OTP is valid' });
  } catch (error: any) {
    console.error('Check OTP error:', error);
    return NextResponse.json({ error: 'Failed to check OTP' }, { status: 500 });
  }
}
