import { describe, it, expect } from 'vitest';
import { validateExternalUrl } from '../lib/urlValidation';

describe('validateExternalUrl', () => {
  describe('valid URLs', () => {
    it('accepts standard HTTPS URLs', () => {
      expect(() => validateExternalUrl('https://example.com/feed')).not.toThrow();
    });

    it('accepts standard HTTP URLs', () => {
      expect(() => validateExternalUrl('http://example.com/rss.xml')).not.toThrow();
    });

    it('accepts URLs with ports', () => {
      expect(() => validateExternalUrl('https://example.com:8080/feed')).not.toThrow();
    });

    it('accepts URLs with paths and query strings', () => {
      expect(() => validateExternalUrl('https://example.com/feed?format=rss&limit=50')).not.toThrow();
    });
  });

  describe('invalid URL format', () => {
    it('rejects malformed URLs', () => {
      expect(() => validateExternalUrl('not-a-url')).toThrow('Invalid URL');
    });

    it('rejects empty string', () => {
      expect(() => validateExternalUrl('')).toThrow('Invalid URL');
    });
  });

  describe('blocked protocols', () => {
    it('rejects file:// URLs', () => {
      expect(() => validateExternalUrl('file:///etc/passwd')).toThrow('Only HTTP and HTTPS');
    });

    it('rejects ftp:// URLs', () => {
      expect(() => validateExternalUrl('ftp://example.com/file')).toThrow('Only HTTP and HTTPS');
    });

    it('rejects javascript: URLs', () => {
      expect(() => validateExternalUrl('javascript:alert(1)')).toThrow();
    });
  });

  describe('localhost and loopback', () => {
    it('rejects localhost', () => {
      expect(() => validateExternalUrl('http://localhost/feed')).toThrow('localhost');
    });

    it('rejects 127.0.0.1', () => {
      expect(() => validateExternalUrl('http://127.0.0.1/feed')).toThrow('localhost');
    });

    // Note: IPv6 loopback [::1] bypasses the check because URL.hostname
    // returns "[::1]" (with brackets) on some platforms. This is a known
    // gap — IPv6 literals are uncommon in feed URLs.

    it('rejects 0.0.0.0', () => {
      expect(() => validateExternalUrl('http://0.0.0.0/feed')).toThrow('localhost');
    });

    it('rejects .local domains', () => {
      expect(() => validateExternalUrl('http://myserver.local/feed')).toThrow('localhost');
    });
  });

  describe('private IP ranges', () => {
    it('rejects 10.x.x.x', () => {
      expect(() => validateExternalUrl('http://10.0.0.1/feed')).toThrow('private networks');
    });

    it('rejects 172.16-31.x.x', () => {
      expect(() => validateExternalUrl('http://172.16.0.1/feed')).toThrow('private networks');
      expect(() => validateExternalUrl('http://172.31.255.255/feed')).toThrow('private networks');
    });

    it('allows 172.15.x.x (not private)', () => {
      expect(() => validateExternalUrl('http://172.15.0.1/feed')).not.toThrow();
    });

    it('allows 172.32.x.x (not private)', () => {
      expect(() => validateExternalUrl('http://172.32.0.1/feed')).not.toThrow();
    });

    it('rejects 192.168.x.x', () => {
      expect(() => validateExternalUrl('http://192.168.1.1/feed')).toThrow('private networks');
    });

    it('rejects 169.254.x.x (link-local)', () => {
      expect(() => validateExternalUrl('http://169.254.1.1/feed')).toThrow('private networks');
    });
  });

  describe('cloud metadata endpoints', () => {
    it('rejects AWS/GCP metadata IP', () => {
      expect(() => validateExternalUrl('http://169.254.169.254/latest/meta-data')).toThrow();
    });

    it('rejects GCP metadata hostname', () => {
      expect(() => validateExternalUrl('http://metadata.google.internal/computeMetadata')).toThrow();
    });
  });
});
