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

    // Update user
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Delete OTP
    await prisma.otpCode.deleteMany({
      where: { email },
    });

    return NextResponse.json({ success: true, message: 'Email verified successfully' });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
