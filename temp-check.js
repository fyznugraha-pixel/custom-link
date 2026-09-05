const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const domains = await prisma.domain.findMany();
  console.log('DOMAINS:', domains);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
