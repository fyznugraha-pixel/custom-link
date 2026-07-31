import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const domains = await prisma.customDomain.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: domains });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain } = body;
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Basic domain validation
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    const cleanDomain = domain.toLowerCase().trim();

    // Check if domain exists
    const existing = await prisma.customDomain.findUnique({
      where: { domain: cleanDomain }
    });

    if (existing) {
      return NextResponse.json({ error: 'Domain already registered' }, { status: 400 });
    }

    // Mock User ID since we don't have auth yet
    const userId = "temp-user-id";

    const customDomain = await prisma.customDomain.create({
      data: {
        domain: cleanDomain,
        user: {
          connectOrCreate: {
            where: { id: userId },
            create: { id: userId, name: "Temp User" }
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: customDomain }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
