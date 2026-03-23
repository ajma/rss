import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const articlesRouter = Router();

articlesRouter.use(authMiddleware);

/**
 * GET /api/articles
 * List articles with pagination and filtering.
 * Query params: feedId, folderId, saved, search, page, limit
 */
articlesRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const {
      feedId,
      folderId,
      saved,
      search,
      page = '1',
      limit = '50',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter: only articles from feeds the user is subscribed to
    const subscriptionFilter: any = { userId };
    if (feedId) {
      subscriptionFilter.feedId = feedId;
    }
    if (folderId) {
      subscriptionFilter.folderId = folderId;
    }

    // Get user's subscribed feed IDs matching the filter
    const subscriptions = await prisma.subscription.findMany({
      where: subscriptionFilter,
      select: { feedId: true },
    });
    const feedIds = subscriptions.map((s) => s.feedId);

    if (feedIds.length === 0) {
      res.json({ articles: [], total: 0, page: pageNum, limit: limitNum });
      return;
    }

    // Build article filter
    const articleWhere: any = {
      feedId: { in: feedIds },
    };

    if (search) {
      articleWhere.OR = [
        { title: { contains: search } },
        { snippet: { contains: search } },
      ];
    }

    // Get total count
    const total = await prisma.article.count({ where: articleWhere });

    // Get articles
    const articles = await prisma.article.findMany({
      where: articleWhere,
      include: {
        feed: {
          select: { id: true, title: true, faviconUrl: true },
        },
        userArticles: {
          where: { userId },
          select: { isRead: true, isSaved: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limitNum,
    });

    // Filter saved articles if requested
    let result = articles.map((article) => {
      const userArticle = article.userArticles[0];
      return {
        id: article.id,
        feedId: article.feedId,
        feedTitle: article.feed.title,
        feedFaviconUrl: article.feed.faviconUrl,
        title: article.title,
        snippet: article.snippet,
        url: article.url,
        author: article.author,
        publishedAt: article.publishedAt,
        isRead: userArticle?.isRead || false,
        isSaved: userArticle?.isSaved || false,
      };
    });

    if (saved === 'true') {
      result = result.filter((a) => a.isSaved);
    }

    res.json({
      articles: result,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/articles/:id
 * Get full article content.
 */
articlesRouter.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        feed: { select: { id: true, title: true, faviconUrl: true } },
        userArticles: {
          where: { userId },
          select: { isRead: true, isSaved: true },
        },
      },
    });

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    // Auto-mark as read when viewing full content
    await prisma.userArticle.upsert({
      where: { userId_articleId: { userId, articleId: id } },
      create: { userId, articleId: id, isRead: true, readAt: new Date() },
      update: { isRead: true, readAt: new Date() },
    });

    const userArticle = article.userArticles[0];
    res.json({
      article: {
        id: article.id,
        feedId: article.feedId,
        feedTitle: article.feed.title,
        feedFaviconUrl: article.feed.faviconUrl,
        title: article.title,
        content: article.content,
        snippet: article.snippet,
        url: article.url,
        author: article.author,
        publishedAt: article.publishedAt,
        isRead: true,
        isSaved: userArticle?.isSaved || false,
      },
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/articles/:id/read
 * Toggle read/unread status.
 */
articlesRouter.patch('/:id/read', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { isRead } = req.body;

    const userArticle = await prisma.userArticle.upsert({
      where: { userId_articleId: { userId, articleId: id } },
      create: {
        userId,
        articleId: id,
        isRead: isRead ?? true,
        readAt: isRead ? new Date() : null,
      },
      update: {
        isRead: isRead ?? true,
        readAt: isRead ? new Date() : null,
      },
    });

    res.json({ userArticle });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/articles/:id/save
 * Toggle saved status.
 */
articlesRouter.patch('/:id/save', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { isSaved } = req.body;

    const userArticle = await prisma.userArticle.upsert({
      where: { userId_articleId: { userId, articleId: id } },
      create: { userId, articleId: id, isSaved: isSaved ?? true },
      update: { isSaved: isSaved ?? true },
    });

    res.json({ userArticle });
  } catch (error) {
    console.error('Save article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/articles/mark-all-read
 * Mark all articles as read, optionally scoped to a feed or folder.
 */
articlesRouter.post('/mark-all-read', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { feedId, folderId } = req.body;

    // Get subscribed feed IDs
    const subFilter: any = { userId };
    if (feedId) subFilter.feedId = feedId;
    if (folderId) subFilter.folderId = folderId;

    const subscriptions = await prisma.subscription.findMany({
      where: subFilter,
      select: { feedId: true },
    });
    const feedIds = subscriptions.map((s) => s.feedId);

    // Get all unread articles from these feeds
    const articles = await prisma.article.findMany({
      where: { feedId: { in: feedIds } },
      select: { id: true },
    });

    // Upsert UserArticle records to mark as read
    const now = new Date();
    for (const article of articles) {
      await prisma.userArticle.upsert({
        where: { userId_articleId: { userId, articleId: article.id } },
        create: { userId, articleId: article.id, isRead: true, readAt: now },
        update: { isRead: true, readAt: now },
      });
    }

    res.json({ message: `Marked ${articles.length} articles as read` });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
