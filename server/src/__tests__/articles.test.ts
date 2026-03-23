import { describe, it, expect } from 'vitest';

/**
 * Tests for article-related utility functions.
 */

describe('Articles', () => {
  describe('Snippet generation', () => {
    function createSnippet(html: string | undefined, maxLength = 200): string {
      if (!html) return '';
      const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    it('should strip HTML tags', () => {
      const html = '<p>Hello <strong>world</strong></p>';
      expect(createSnippet(html)).toBe('Hello world');
    });

    it('should truncate long text', () => {
      const html = 'A'.repeat(300);
      const snippet = createSnippet(html);
      expect(snippet.length).toBe(203); // 200 + '...'
      expect(snippet.endsWith('...')).toBe(true);
    });

    it('should handle empty/undefined input', () => {
      expect(createSnippet(undefined)).toBe('');
      expect(createSnippet('')).toBe('');
    });

    it('should collapse whitespace', () => {
      const html = '<p>Hello   \n  world</p>';
      expect(createSnippet(html)).toBe('Hello world');
    });
  });

  describe('Time ago formatting', () => {
    function timeAgo(dateStr: string | null): string {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `${diffDays}d`;
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths}mo`;
    }

    it('should return empty string for null', () => {
      expect(timeAgo(null)).toBe('');
    });

    it('should return "now" for very recent dates', () => {
      const now = new Date().toISOString();
      expect(timeAgo(now)).toBe('now');
    });

    it('should format hours correctly', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      expect(timeAgo(twoHoursAgo)).toBe('2h');
    });

    it('should format days correctly', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(timeAgo(threeDaysAgo)).toBe('3d');
    });
  });
});
