const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.bdnrphhcpiqkfpvrxfiz:@Kopihitam2005@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const res = await client.query(`SELECT "id", "shortCode", "domainId" FROM "Link" WHERE "shortCode" ILIKE '21Agustus'`);
  console.log("Link:", res.rows);
  
  const domains = await client.query(`SELECT * FROM "CustomDomain"`);
  console.log("Domains:", domains.rows);
  
  await client.end();
}

run().catch(console.error);
