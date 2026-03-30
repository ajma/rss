import { DOMParser } from 'linkedom';

export interface OpmlFeed {
  title: string;
  xmlUrl: string;
  htmlUrl?: string;
  folder?: string;
}

/**
 * Parses an OPML XML string and extracts feed entries with optional folder grouping.
 */
export function parseOpml(xml: string): OpmlFeed[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const feeds: OpmlFeed[] = [];

  const body = doc.querySelector('body');
  if (!body) return feeds;

  // Process top-level <outline> elements in the body
  for (const outline of Array.from(body.children)) {
    if (outline.nodeName !== 'outline') continue;
    processOutline(outline as Element, undefined, feeds);
  }

  return feeds;
}

function processOutline(el: Element, folder: string | undefined, feeds: OpmlFeed[]) {
  const xmlUrl = el.getAttribute('xmlUrl') || el.getAttribute('xmlurl');

  if (xmlUrl) {
    // This is a feed entry
    feeds.push({
      title: el.getAttribute('title') || el.getAttribute('text') || xmlUrl,
      xmlUrl,
      htmlUrl: el.getAttribute('htmlUrl') || el.getAttribute('htmlurl') || undefined,
      folder,
    });
  } else {
    // This is a folder — recurse into children
    const folderName = el.getAttribute('title') || el.getAttribute('text') || undefined;
    for (const child of Array.from(el.children)) {
      if (child.nodeName === 'outline') {
        processOutline(child as Element, folderName || folder, feeds);
      }
    }
  }
}
