import prisma from '../lib/prisma';
import { fetchAndStoreArticles } from './feedParser';

const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Refreshes all feeds by fetching new articles.
 * Called periodically by the feed refresher.
 */
async function refreshAllFeeds(): Promise<void> {
  try {
    const feeds = await prisma.feed.findMany({
      select: { id: true, url: true, title: true },
    });

    console.log(`Refreshing ${feeds.length} feeds...`);

    for (const feed of feeds) {
      const newCount = await fetchAndStoreArticles(feed.id, feed.url);
      if (newCount > 0) {
        console.log(`  ${feed.title}: ${newCount} new articles`);
      }
    }

    console.log('Feed refresh complete.');
  } catch (error) {
    console.error('Error during feed refresh:', error);
  }
}

/**
 * Starts the periodic feed refresher.
 * Runs an initial refresh immediately, then every REFRESH_INTERVAL_MS.
 */
export function startFeedRefresher(): void {
  // Run initial refresh after a short delay to let the server start
  setTimeout(() => {
    refreshAllFeeds();
  }, 5000);

  // Then refresh periodically
  setInterval(() => {
    refreshAllFeeds();
  }, REFRESH_INTERVAL_MS);

  console.log(`Feed refresher started (interval: ${REFRESH_INTERVAL_MS / 1000}s)`);
}
