import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Find the fylink.fun domains
    const domains = await prisma.customDomain.findMany({
      where: {
        OR: [
          { domain: 'fylink.fun' },
          { domain: 'www.fylink.fun' }
        ]
      }
    });

    if (domains.length === 0) {
      return NextResponse.json({ message: "No fylink.fun domains found in CustomDomain table." });
    }

    const domainIds = domains.map(d => d.id);

    // Update all links that belong to fylink.fun to belong to the default domain (domainId = null)
    const result = await prisma.link.updateMany({
      where: {
        domainId: { in: domainIds }
      },
      data: {
        domainId: null
      }
    });

    // Delete the fylink.fun custom domains so they don't cause conflicts
    await prisma.customDomain.deleteMany({
      where: {
        id: { in: domainIds }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Migrated ${result.count} links from fylink.fun to fyurl.fun (default domain). fylink.fun custom domains have been removed from the database.` 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
