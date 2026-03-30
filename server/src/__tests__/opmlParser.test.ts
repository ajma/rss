import { describe, it, expect } from 'vitest';
import { parseOpml } from '../services/opmlParser';

describe('parseOpml', () => {
  it('should parse top-level feeds without folders', () => {
    const opml = `<?xml version="1.0" encoding="UTF-8"?>
    <opml version="1.0">
      <head><title>Test</title></head>
      <body>
        <outline text="Feed One" title="Feed One" type="rss" xmlUrl="https://example.com/feed1" htmlUrl="https://example.com"/>
        <outline text="Feed Two" title="Feed Two" type="rss" xmlUrl="https://example.com/feed2"/>
      </body>
    </opml>`;

    const feeds = parseOpml(opml);
    expect(feeds).toHaveLength(2);
    expect(feeds[0]).toEqual({
      title: 'Feed One',
      xmlUrl: 'https://example.com/feed1',
      htmlUrl: 'https://example.com',
      folder: undefined,
    });
    expect(feeds[1]).toEqual({
      title: 'Feed Two',
      xmlUrl: 'https://example.com/feed2',
      htmlUrl: undefined,
      folder: undefined,
    });
  });

  it('should parse feeds inside folders', () => {
    const opml = `<?xml version="1.0" encoding="UTF-8"?>
    <opml version="1.0">
      <head><title>Test</title></head>
      <body>
        <outline text="Tech" title="Tech">
          <outline text="HN" title="Hacker News" type="rss" xmlUrl="https://news.ycombinator.com/rss" htmlUrl="https://news.ycombinator.com/"/>
          <outline text="TC" title="TechCrunch" type="rss" xmlUrl="https://techcrunch.com/feed/"/>
        </outline>
      </body>
    </opml>`;

    const feeds = parseOpml(opml);
    expect(feeds).toHaveLength(2);
    expect(feeds[0].folder).toBe('Tech');
    expect(feeds[0].title).toBe('Hacker News');
    expect(feeds[1].folder).toBe('Tech');
    expect(feeds[1].title).toBe('TechCrunch');
  });

  it('should handle a mix of top-level feeds and folders', () => {
    const opml = `<?xml version="1.0" encoding="UTF-8"?>
    <opml version="1.0">
      <head><title>Test</title></head>
      <body>
        <outline text="Standalone" type="rss" xmlUrl="https://example.com/standalone"/>
        <outline text="News" title="News">
          <outline text="CNN" type="rss" xmlUrl="https://cnn.com/rss"/>
        </outline>
        <outline text="Another" type="rss" xmlUrl="https://example.com/another"/>
      </body>
    </opml>`;

    const feeds = parseOpml(opml);
    expect(feeds).toHaveLength(3);
    expect(feeds[0]).toMatchObject({ title: 'Standalone', folder: undefined });
    expect(feeds[1]).toMatchObject({ title: 'CNN', folder: 'News' });
    expect(feeds[2]).toMatchObject({ title: 'Another', folder: undefined });
  });

  it('should use text attribute as fallback when title is missing', () => {
    const opml = `<?xml version="1.0" encoding="UTF-8"?>
    <opml version="1.0">
      <head><title>Test</title></head>
      <body>
        <outline text="My Feed" type="rss" xmlUrl="https://example.com/feed"/>
      </body>
    </opml>`;

    const feeds = parseOpml(opml);
    expect(feeds[0].title).toBe('My Feed');
  });

  it('should return empty array for empty body', () => {
    const opml = `<?xml version="1.0" encoding="UTF-8"?>
    <opml version="1.0">
      <head><title>Test</title></head>
      <body></body>
    </opml>`;

    expect(parseOpml(opml)).toHaveLength(0);
  });

  it('should return empty array when no body element exists', () => {
    const opml = `<?xml version="1.0" encoding="UTF-8"?>
    <opml version="1.0"><head><title>Test</title></head></opml>`;

    expect(parseOpml(opml)).toHaveLength(0);
  });

  it('should parse a real-world Inoreader export with multiple folders', () => {
    const opml = `<?xml version="1.0" encoding="UTF-8"?>
    <opml version="1.0">
      <head><title>Inoreader Export</title></head>
      <body>
        <outline text="Hacker News" title="Hacker News" type="rss" xmlUrl="https://news.ycombinator.com/rss" htmlUrl="https://news.ycombinator.com/"/>
        <outline text="First Reads" title="First Reads">
          <outline text="GeekWire" title="GeekWire" type="rss" xmlUrl="https://www.geekwire.com/feed/" htmlUrl="https://www.geekwire.com"/>
          <outline text="TechCrunch" title="TechCrunch" type="rss" xmlUrl="https://techcrunch.com/feed/" htmlUrl="http://www.techcrunch.com"/>
        </outline>
        <outline text="Money" title="Money">
          <outline text="YNAB Blog" title="YNAB Blog" type="rss" xmlUrl="https://www.youneedabudget.com/blog/rss.xml" htmlUrl="https://www.ynab.com/"/>
        </outline>
      </body>
    </opml>`;

    const feeds = parseOpml(opml);
    expect(feeds).toHaveLength(4);
    expect(feeds[0]).toMatchObject({ title: 'Hacker News', folder: undefined });
    expect(feeds[1]).toMatchObject({ title: 'GeekWire', folder: 'First Reads' });
    expect(feeds[2]).toMatchObject({ title: 'TechCrunch', folder: 'First Reads' });
    expect(feeds[3]).toMatchObject({ title: 'YNAB Blog', folder: 'Money' });
  });
});
