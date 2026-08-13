import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import dns from 'dns/promises';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const customDomain = await prisma.customDomain.findUnique({
      where: { id }
    });

    if (!customDomain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // The expected verification string
    const expectedTxt = `link-verification=${customDomain.id}`;
    let isVerified = false;

    try {
      // Use Google DNS over HTTPS to bypass local OS DNS caching issues
      const res = await fetch(`https://dns.google/resolve?name=${customDomain.domain}&type=TXT`, { cache: 'no-store' });
      const data = await res.json();
      
      if (data.Answer) {
        for (const record of data.Answer) {
          // Google DNS returns TXT records as strings with extra quotes, e.g., "\"link-verification=...\""
          const recordData = record.data.replace(/(^"|"$)/g, '');
          if (recordData === expectedTxt) {
            isVerified = true;
            break;
          }
        }
      }
    } catch (dnsError) {
      console.error('DNS resolution error:', dnsError);
    }

    if (isVerified) {
      const updated = await prisma.customDomain.update({
        where: { id },
        data: { status: 'verified' }
      });
      return NextResponse.json({ success: true, data: updated });
    } else {
      const updated = await prisma.customDomain.update({
        where: { id },
        data: { status: 'failed' }
      });
      return NextResponse.json({ 
        success: false, 
        error: 'Verification failed. TXT record not found or does not match.',
        data: updated 
      }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('Verification API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
