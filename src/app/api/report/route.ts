import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ratelimit } from "@/lib/ratelimit";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Basic Rate limiting to prevent spamming the report endpoint
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await ratelimit.limit(`report_${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { shortUrl, reason } = body;

    if (!shortUrl || !reason) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Save report to database
    await prisma.report.create({
      data: {
        shortUrl,
        reason,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
