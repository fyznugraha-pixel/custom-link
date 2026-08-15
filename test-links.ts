import prisma from './src/lib/prisma';

async function check() {
  const link = await prisma.link.findFirst({
    where: { shortCode: { equals: '21agustus', mode: 'insensitive' } },
    include: { domain: true }
  });
  console.log("Link:", JSON.stringify(link, null, 2));
}

check().catch(console.error).finally(() => process.exit());
