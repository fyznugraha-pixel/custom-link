import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import dns from 'dns/promises';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    
    const customDomain = await prisma.customDomain.findUnique({
      where: { id }
    });

    if (!customDomain || customDomain.userId !== session.user.id) {
      return NextResponse.json({ error: 'Domain not found or unauthorized' }, { status: 404 });
    }

    // The expected verification string
    const expectedTxt = `link-verification=${customDomain.id}`;
    let isVerified = false;

    try {
      // Resolve TXT records for the domain
      const txtRecords = await dns.resolveTxt(customDomain.domain);
      
      for (const recordArray of txtRecords) {
        const recordStr = recordArray.join('');
        if (recordStr === expectedTxt) {
          isVerified = true;
          break;
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
