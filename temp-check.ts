import prisma from './src/lib/prisma';

async function main() {
  const domains = await prisma.domain.findMany();
  console.log('DOMAINS:', domains);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
