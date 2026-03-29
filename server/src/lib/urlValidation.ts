/**
 * Validates that a URL is safe to fetch (not targeting internal/private networks).
 * Prevents SSRF attacks via user-supplied feed URLs.
 */
export function validateExternalUrl(urlString: string): void {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error('Invalid URL');
  }

  // Only allow http and https
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS URLs are allowed');
  }

  const hostname = url.hostname.toLowerCase();

  // Block localhost and loopback
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local')
  ) {
    throw new Error('URLs pointing to localhost are not allowed');
  }

  // Block private IP ranges
  const privatePatterns = [
    /^10\.\d+\.\d+\.\d+$/,           // 10.0.0.0/8
    /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/, // 172.16.0.0/12
    /^192\.168\.\d+\.\d+$/,          // 192.168.0.0/16
    /^169\.254\.\d+\.\d+$/,          // link-local
    /^0\.\d+\.\d+\.\d+$/,           // 0.0.0.0/8
  ];

  for (const pattern of privatePatterns) {
    if (pattern.test(hostname)) {
      throw new Error('URLs pointing to private networks are not allowed');
    }
  }

  // Block cloud metadata endpoints
  if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
    throw new Error('URLs pointing to cloud metadata services are not allowed');
  }
}
