import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash,
      name: 'Demo User',
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create folders
  const techFolder = await prisma.folder.upsert({
    where: { userId_name: { userId: user.id, name: 'Technology' } },
    update: {},
    create: { name: 'Technology', userId: user.id, order: 0 },
  });

  const newsFolder = await prisma.folder.upsert({
    where: { userId_name: { userId: user.id, name: 'News' } },
    update: {},
    create: { name: 'News', userId: user.id, order: 1 },
  });

  console.log(`Created folders: ${techFolder.name}, ${newsFolder.name}`);

  // Create feeds
  const hnFeed = await prisma.feed.upsert({
    where: { url: 'https://hnrss.org/frontpage' },
    update: {},
    create: {
      title: 'Hacker News',
      url: 'https://hnrss.org/frontpage',
      siteUrl: 'https://news.ycombinator.com',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=news.ycombinator.com&sz=32',
    },
  });

  const techCrunchFeed = await prisma.feed.upsert({
    where: { url: 'https://techcrunch.com/feed/' },
    update: {},
    create: {
      title: 'TechCrunch',
      url: 'https://techcrunch.com/feed/',
      siteUrl: 'https://techcrunch.com',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=techcrunch.com&sz=32',
    },
  });

  console.log('Created feeds');

  // Create subscriptions
  await prisma.subscription.upsert({
    where: { userId_feedId: { userId: user.id, feedId: hnFeed.id } },
    update: {},
    create: { userId: user.id, feedId: hnFeed.id, folderId: techFolder.id },
  });

  await prisma.subscription.upsert({
    where: { userId_feedId: { userId: user.id, feedId: techCrunchFeed.id } },
    update: {},
    create: { userId: user.id, feedId: techCrunchFeed.id, folderId: techFolder.id },
  });

  console.log('Created subscriptions');
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
