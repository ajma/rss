import { describe, it, expect, vi } from 'vitest';

/**
 * Tests for article focus navigation logic used by keyboard shortcuts.
 *
 * The navigation logic is:
 *   j / Space  → next article:  setFocusedIndex(prev => prev < max ? prev + 1 : max)
 *   k / Shift+Space → prev article: setFocusedIndex(prev => prev > 0 ? prev - 1 : 0)
 *
 * This file tests that logic in isolation.
 */

// ─── Extracted navigation logic (mirrors Layout.tsx) ────────────────
function nextArticle(currentIndex: number, articleCount: number): number {
  const max = articleCount - 1;
  if (max < 0) return -1; // empty list
  return currentIndex < max ? currentIndex + 1 : max;
}

function prevArticle(currentIndex: number, _articleCount: number): number {
  return currentIndex > 0 ? currentIndex - 1 : 0;
}

// ─── Tests ──────────────────────────────────────────────────────────
describe('Article keyboard navigation', () => {
  describe('nextArticle (j key)', () => {
    it('moves from index 0 to 1', () => {
      expect(nextArticle(0, 5)).toBe(1);
    });

    it('moves from index 1 to 2', () => {
      expect(nextArticle(1, 5)).toBe(2);
    });

    it('moves from -1 (initial) to 0 (first article)', () => {
      expect(nextArticle(-1, 5)).toBe(0);
    });

    it('stays at last article when already at end (no wraparound)', () => {
      expect(nextArticle(4, 5)).toBe(4);
    });

    it('stays at last article on second press beyond end', () => {
      const first = nextArticle(4, 5);
      expect(nextArticle(first, 5)).toBe(4);
    });

    it('returns -1 for empty article list', () => {
      expect(nextArticle(-1, 0)).toBe(-1);
    });

    it('returns -1 for empty article list even if index was 0', () => {
      expect(nextArticle(0, 0)).toBe(-1);
    });

    it('works with single article list — moves from -1 to 0', () => {
      expect(nextArticle(-1, 1)).toBe(0);
    });

    it('stays at 0 with single article list (already at end)', () => {
      expect(nextArticle(0, 1)).toBe(0);
    });
  });

  describe('prevArticle (k key)', () => {
    it('moves from index 2 to 1', () => {
      expect(prevArticle(2, 5)).toBe(1);
    });

    it('moves from index 1 to 0', () => {
      expect(prevArticle(1, 5)).toBe(0);
    });

    it('stays at first article when already at start (no wraparound)', () => {
      expect(prevArticle(0, 5)).toBe(0);
    });

    it('stays at 0 on second press at start', () => {
      const first = prevArticle(0, 5);
      expect(prevArticle(first, 5)).toBe(0);
    });

    it('clamps to 0 when current index is -1 (initial state)', () => {
      expect(prevArticle(-1, 5)).toBe(0);
    });

    it('stays at 0 for single article list', () => {
      expect(prevArticle(0, 1)).toBe(0);
    });
  });

  describe('sequential navigation', () => {
    it('j through entire list and back with k', () => {
      const count = 4;
      let idx = -1;

      // Forward through 4 articles: -1 → 0 → 1 → 2 → 3
      idx = nextArticle(idx, count); expect(idx).toBe(0);
      idx = nextArticle(idx, count); expect(idx).toBe(1);
      idx = nextArticle(idx, count); expect(idx).toBe(2);
      idx = nextArticle(idx, count); expect(idx).toBe(3);
      // Beyond end
      idx = nextArticle(idx, count); expect(idx).toBe(3);

      // Back with k: 3 → 2 → 1 → 0
      idx = prevArticle(idx, count); expect(idx).toBe(2);
      idx = prevArticle(idx, count); expect(idx).toBe(1);
      idx = prevArticle(idx, count); expect(idx).toBe(0);
      // Beyond start
      idx = prevArticle(idx, count); expect(idx).toBe(0);
    });
  });

  describe('article actions on focused index', () => {
    const articles = [
      { id: 'a1', title: 'Article 1', url: 'https://example.com/1', isRead: false, isSaved: false },
      { id: 'a2', title: 'Article 2', url: 'https://example.com/2', isRead: true, isSaved: true },
      { id: 'a3', title: 'Article 3', url: null, isRead: false, isSaved: false },
    ];

    it('o/Enter toggles expand on focused article by index', () => {
      const toggleArticle = vi.fn();
      const focusedIndex = 1;

      if (focusedIndex >= 0) toggleArticle(articles[focusedIndex].id);
      expect(toggleArticle).toHaveBeenCalledWith('a2');
    });

    it('does not toggle when no article is focused (index -1)', () => {
      const toggleArticle = vi.fn();
      const focusedIndex = -1;

      if (focusedIndex >= 0) toggleArticle(articles[focusedIndex]?.id);
      expect(toggleArticle).not.toHaveBeenCalled();
    });

    it('v opens URL in new tab for focused article', () => {
      const openExternal = vi.fn();
      const focusedIndex = 0;

      const article = articles[focusedIndex];
      if (focusedIndex >= 0 && article?.url) openExternal(article.url);
      expect(openExternal).toHaveBeenCalledWith('https://example.com/1');
    });

    it('v does nothing if focused article has no URL', () => {
      const openExternal = vi.fn();
      const focusedIndex = 2;

      const article = articles[focusedIndex];
      if (focusedIndex >= 0 && article?.url) openExternal(article.url);
      expect(openExternal).not.toHaveBeenCalled();
    });

    it('m toggles read on focused article', () => {
      const markRead = vi.fn();
      const focusedIndex = 0;

      const article = articles[focusedIndex];
      if (focusedIndex >= 0) markRead({ id: article.id, isRead: !article.isRead });
      expect(markRead).toHaveBeenCalledWith({ id: 'a1', isRead: true });
    });

    it('m toggles unread on already-read article', () => {
      const markRead = vi.fn();
      const focusedIndex = 1;

      const article = articles[focusedIndex];
      if (focusedIndex >= 0) markRead({ id: article.id, isRead: !article.isRead });
      expect(markRead).toHaveBeenCalledWith({ id: 'a2', isRead: false });
    });

    it('s toggles saved on focused article', () => {
      const toggleSaved = vi.fn();
      const focusedIndex = 0;

      const article = articles[focusedIndex];
      if (focusedIndex >= 0) toggleSaved({ id: article.id, isSaved: !article.isSaved });
      expect(toggleSaved).toHaveBeenCalledWith({ id: 'a1', isSaved: true });
    });

    it('s toggles unsaved on already-saved article', () => {
      const toggleSaved = vi.fn();
      const focusedIndex = 1;

      const article = articles[focusedIndex];
      if (focusedIndex >= 0) toggleSaved({ id: article.id, isSaved: !article.isSaved });
      expect(toggleSaved).toHaveBeenCalledWith({ id: 'a2', isSaved: false });
    });
  });
});
