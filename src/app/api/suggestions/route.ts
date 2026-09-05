import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only use rate limiting if UPSTASH variables are set
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 requests per hour
  analytics: true,
}) : null;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    
    // Rate limiting to prevent spam
    if (ratelimit) {
      const { success } = await ratelimit.limit(`suggestions_${ip}`);
      if (!success) {
        return NextResponse.json(
          { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const { content, email } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Konten saran tidak valid' },
        { status: 400 }
      );
    }

    const suggestion = await prisma.suggestion.create({
      data: {
        content: content.trim(),
        email: email ? email.trim() : null,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, id: suggestion.id }, { status: 201 });
  } catch (error) {
    console.error('Error submitting suggestion:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses permintaan' },
      { status: 500 }
    );
  }
}
