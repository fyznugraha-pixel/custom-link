import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const domains = await prisma.customDomain.findMany();
  console.log("Current domains:");
  domains.forEach((d: any) => console.log(`${d.domain} - UserID: ${d.userId}`));

  // Update all domains to admin-system just in case
  const res = await prisma.customDomain.updateMany({
    data: {
      userId: 'admin-system'
    }
  });

  console.log(`Updated ${res.count} domains to admin-system.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
