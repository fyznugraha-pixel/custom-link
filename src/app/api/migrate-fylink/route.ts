import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Find the fyurl.id domains
    const domains = await prisma.customDomain.findMany({
      where: {
        OR: [
          { domain: 'fyurl.id' },
          { domain: 'www.fyurl.id' }
        ]
      }
    });

    if (domains.length === 0) {
      return NextResponse.json({ message: "No fyurl.id domains found in CustomDomain table." });
    }

    const domainIds = domains.map(d => d.id);

    // Update all links that belong to fyurl.id to belong to the default domain (domainId = null)
    const result = await prisma.link.updateMany({
      where: {
        domainId: { in: domainIds }
      },
      data: {
        domainId: null
      }
    });

    // Delete the fyurl.id custom domains so they don't cause conflicts
    await prisma.customDomain.deleteMany({
      where: {
        id: { in: domainIds }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Migrated ${result.count} links from fyurl.id to fyurl.id (default domain). fyurl.id custom domains have been removed from the database.` 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
