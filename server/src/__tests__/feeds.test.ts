import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// Mock Prisma client
vi.mock('../lib/prisma', () => ({
  default: {
    subscription: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    feed: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    article: {
      count: vi.fn(),
    },
    userArticle: {
      findMany: vi.fn(),
    },
  },
}));

describe('Feeds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feed URL validation', () => {
    it('should accept valid feed URLs', () => {
      const schema = z.object({ url: z.string().url() });

      expect(schema.safeParse({ url: 'https://example.com/rss' }).success).toBe(true);
      expect(schema.safeParse({ url: 'https://hnrss.org/frontpage' }).success).toBe(true);
    });

    it('should reject invalid feed URLs', () => {
      const schema = z.object({ url: z.string().url() });

      expect(schema.safeParse({ url: 'not-a-url' }).success).toBe(false);
      expect(schema.safeParse({ url: '' }).success).toBe(false);
    });
  });

  describe('Feed favicon generation', () => {
    it('should generate favicon URL from site URL', () => {
      const siteUrl = 'https://news.ycombinator.com';
      const hostname = new URL(siteUrl).hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

      expect(faviconUrl).toBe(
        'https://www.google.com/s2/favicons?domain=news.ycombinator.com&sz=32'
      );
    });
  });
});
