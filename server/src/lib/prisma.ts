import { PrismaClient } from '../../generated/client/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Singleton Prisma client instance with required v7 driver adapter
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
});
const prisma = new PrismaClient({ adapter });

export default prisma;
