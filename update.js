const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const domains = await prisma.customDomain.findMany();
  console.log("Current domains:");
  domains.forEach(d => console.log(`${d.domain} - UserID: ${d.userId}`));

  // Update fyurl.fun and fylink.fun to admin-system
  const res = await prisma.customDomain.updateMany({
    where: {
      domain: { in: ['fyurl.fun', 'fylink.fun'] }
    },
    data: {
      userId: 'admin-system'
    }
  });

  console.log(`Updated ${res.count} domains to admin-system.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
