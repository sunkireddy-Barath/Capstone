require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createIndexes() {
  console.log('Creating pg_trgm GIN indexes for full-text search...');
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS villages_name_trgm_idx
      ON villages USING GIN (name gin_trgm_ops);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS sub_districts_name_trgm_idx
      ON sub_districts USING GIN (name gin_trgm_ops);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS districts_name_trgm_idx
      ON districts USING GIN (name gin_trgm_ops);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS states_name_trgm_idx
      ON states USING GIN (name gin_trgm_ops);
    `);
    console.log('✅ GIN indexes created successfully.');
  } catch (err) {
    console.error('Index creation error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

createIndexes();
