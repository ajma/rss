import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const foldersRouter = Router();

foldersRouter.use(authMiddleware);

/**
 * GET /api/folders
 * List all folders for the authenticated user with their subscriptions.
 */
foldersRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const folders = await prisma.folder.findMany({
      where: { userId },
      include: {
        subscriptions: {
          include: {
            feed: {
              include: {
                articles: { select: { id: true } },
              },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Get read article IDs
    const readArticles = await prisma.userArticle.findMany({
      where: { userId, isRead: true },
      select: { articleId: true },
    });
    const readArticleIds = new Set(readArticles.map((ua) => ua.articleId));

    const result = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      order: folder.order,
      feeds: folder.subscriptions.map((sub) => ({
        id: sub.id,
        feedId: sub.feed.id,
        title: sub.customTitle || sub.feed.title,
        url: sub.feed.url,
        faviconUrl: sub.feed.faviconUrl,
        unreadCount: sub.feed.articles.filter((a) => !readArticleIds.has(a.id)).length,
      })),
      unreadCount: folder.subscriptions.reduce(
        (sum, sub) =>
          sum + sub.feed.articles.filter((a) => !readArticleIds.has(a.id)).length,
        0
      ),
    }));

    res.json({ folders: result });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const folderSchema = z.object({
  name: z.string().min(1).max(100),
});

/**
 * POST /api/folders
 * Create a new folder.
 */
foldersRouter.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const data = folderSchema.parse(req.body);

    // Get max order for user's folders
    const maxOrder = await prisma.folder.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const folder = await prisma.folder.create({
      data: {
        name: data.name,
        userId,
        order: (maxOrder?.order ?? -1) + 1,
      },
    });

    res.status(201).json({ folder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/folders/:id
 * Rename a folder.
 */
foldersRouter.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const data = folderSchema.parse(req.body);

    const folder = await prisma.folder.findFirst({ where: { id, userId } });
    if (!folder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    const updated = await prisma.folder.update({
      where: { id },
      data: { name: data.name },
    });

    res.json({ folder: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Update folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/folders/:id
 * Delete a folder. Moves its feeds to the root (no folder).
 */
foldersRouter.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const folder = await prisma.folder.findFirst({ where: { id, userId } });
    if (!folder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    // Move subscriptions to root
    await prisma.subscription.updateMany({
      where: { folderId: id },
      data: { folderId: null },
    });

    await prisma.folder.delete({ where: { id } });
    res.json({ message: 'Folder deleted' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
