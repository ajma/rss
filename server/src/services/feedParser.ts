import Parser from 'rss-parser';
import prisma from '../lib/prisma';
import { validateExternalUrl } from '../lib/urlValidation';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'RSS-Reader/1.0',
  },
});

/**
 * Strips HTML tags and truncates text for use as an article snippet.
 */
function createSnippet(html: string | undefined, maxLength = 200): string {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Fetches and parses an RSS feed from a URL, returning the parsed feed data.
 */
export async function parseFeed(url: string) {
  validateExternalUrl(url);
  const feed = await parser.parseURL(url);
  return feed;
}

/**
 * Fetches a feed URL, parses its articles, and stores new articles in the database.
 * Returns the number of new articles added.
 */
export async function fetchAndStoreArticles(feedId: string, feedUrl: string): Promise<number> {
  try {
    const feed = await parser.parseURL(feedUrl);
    let newCount = 0;

    for (const item of feed.items) {
      const guid = item.guid || item.link || item.title || '';
      if (!guid) continue;

      try {
        await prisma.article.create({
          data: {
            feedId,
            title: item.title || 'Untitled',
            content: item['content:encoded'] || item.content || item.summary || '',
            snippet: createSnippet(item['content:encoded'] || item.content || item.summary),
            url: item.link || null,
            author: item.creator || item.author || null,
            publishedAt: item.pubDate ? new Date(item.pubDate) : null,
            guid,
          },
        });
        newCount++;
      } catch {
        // Article with this guid already exists for this feed — skip
      }
    }

    // Update feed's lastFetchedAt timestamp
    await prisma.feed.update({
      where: { id: feedId },
      data: { lastFetchedAt: new Date() },
    });

    return newCount;
  } catch (error) {
    console.error(`Error fetching feed ${feedUrl}:`, error);
    return 0;
  }
}
