import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
import { validateExternalUrl } from '../lib/urlValidation';

/**
 * Fetches the HTML from an article URL and extracts the main article
 * content using Mozilla's Readability algorithm.
 *
 * Returns the extracted HTML content string, or null if extraction fails.
 */
export async function extractArticleContent(url: string): Promise<string | null> {
  try {
    validateExternalUrl(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    console.log(`Extracting content from ${url}`);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Failed to fetch article URL ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const { document } = parseHTML(html);

    const reader = new Readability(document as any);
    const article = reader.parse();

    if (!article || !article.content) {
      console.warn(`Readability could not extract content from ${url}`);
      return null;
    }

    return article.content;
  } catch (error) {
    console.error(`Error extracting content from ${url}:`, error);
    return null;
  }
}
