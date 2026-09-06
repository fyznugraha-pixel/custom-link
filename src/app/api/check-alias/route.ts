import { NextResponse } from "next/server";
import { LinkRepository } from "@/repositories/link.repository";

const linkRepository = new LinkRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const alias = searchParams.get('alias');
    const domainId = searchParams.get('domainId');

    if (!alias) {
      return NextResponse.json({ available: false });
    }

    // Validate format
    if (!/^[a-zA-Z0-9-_]+$/.test(alias)) {
      return NextResponse.json({ available: false });
    }

    const exists = await linkRepository.checkAliasExists(alias, domainId || undefined);
    
    if (exists) {
      // Check if it's expired. If it's expired, it's considered available because the backend will archive the old one.
      const link = await linkRepository.findByShortCode(alias, domainId || undefined);
      if (link && link.expiresAt && link.expiresAt < new Date()) {
        return NextResponse.json({ available: true });
      }
      return NextResponse.json({ available: false });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    return NextResponse.json({ available: false }, { status: 500 });
  }
}
