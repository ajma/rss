import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { parseFeed, fetchAndStoreArticles } from '../services/feedParser';

export const feedsRouter = Router();

// All feed routes require authentication
feedsRouter.use(authMiddleware);

/**
 * GET /api/feeds
 * List all subscriptions for the authenticated user, grouped by folder,
 * with unread counts.
 */
feedsRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // Get all subscriptions with feed info and unread counts
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        feed: {
          include: {
            articles: {
              select: { id: true },
            },
          },
        },
        folder: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Get read article IDs for this user
    const readArticles = await prisma.userArticle.findMany({
      where: { userId, isRead: true },
      select: { articleId: true },
    });
    const readArticleIds = new Set(readArticles.map((ua) => ua.articleId));

    // Build response with unread counts
    const result = subscriptions.map((sub) => {
      const unreadCount = sub.feed.articles.filter(
        (a) => !readArticleIds.has(a.id)
      ).length;

      return {
        id: sub.id,
        feedId: sub.feed.id,
        title: sub.customTitle || sub.feed.title,
        url: sub.feed.url,
        siteUrl: sub.feed.siteUrl,
        faviconUrl: sub.feed.faviconUrl,
        folderId: sub.folderId,
        folderName: sub.folder?.name || null,
        unreadCount,
      };
    });

    res.json({ subscriptions: result });
  } catch (error) {
    console.error('Get feeds error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const subscribeSchema = z.object({
  url: z.string().url(),
  folderId: z.string().optional(),
});

/**
 * POST /api/feeds/subscribe
 * Subscribe to a new RSS feed. Creates the feed if it doesn't exist yet.
 */
feedsRouter.post('/subscribe', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const data = subscribeSchema.parse(req.body);

    // Check if feed already exists in DB
    let feed = await prisma.feed.findUnique({ where: { url: data.url } });

    if (!feed) {
      // Fetch and parse the feed to get its metadata
      const parsed = await parseFeed(data.url);

      feed = await prisma.feed.create({
        data: {
          title: parsed.title || data.url,
          url: data.url,
          siteUrl: parsed.link || null,
          faviconUrl: parsed.link
            ? `https://www.google.com/s2/favicons?domain=${new URL(parsed.link).hostname}&sz=32`
            : null,
        },
      });

      // Fetch initial articles
      await fetchAndStoreArticles(feed.id, feed.url);
    }

    // Check if already subscribed
    const existing = await prisma.subscription.findUnique({
      where: { userId_feedId: { userId, feedId: feed.id } },
    });
    if (existing) {
      res.status(409).json({ error: 'Already subscribed to this feed' });
      return;
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        feedId: feed.id,
        folderId: data.folderId || null,
      },
      include: { feed: true, folder: true },
    });

    // Count articles as unread
    const articleCount = await prisma.article.count({
      where: { feedId: feed.id },
    });

    res.status(201).json({
      subscription: {
        id: subscription.id,
        feedId: feed.id,
        title: feed.title,
        url: feed.url,
        siteUrl: feed.siteUrl,
        faviconUrl: feed.faviconUrl,
        folderId: subscription.folderId,
        folderName: subscription.folder?.name || null,
        unreadCount: articleCount,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe to feed' });
  }
});

/**
 * DELETE /api/feeds/:subscriptionId
 * Unsubscribe from a feed.
 */
feedsRouter.delete('/:subscriptionId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { subscriptionId } = req.params;

    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    await prisma.subscription.delete({ where: { id: subscriptionId } });
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/feeds/:subscriptionId
 * Update a subscription (move to folder, rename).
 */
feedsRouter.patch('/:subscriptionId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { subscriptionId } = req.params;
    const { folderId, customTitle } = req.body;

    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        ...(folderId !== undefined && { folderId: folderId || null }),
        ...(customTitle !== undefined && { customTitle }),
      },
      include: { feed: true, folder: true },
    });

    res.json({
      subscription: {
        id: updated.id,
        feedId: updated.feedId,
        title: updated.customTitle || updated.feed.title,
        url: updated.feed.url,
        folderId: updated.folderId,
        folderName: updated.folder?.name || null,
      },
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
