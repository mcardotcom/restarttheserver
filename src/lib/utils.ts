export function normalizeUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    // Reconstruct the URL without query parameters or hash
    return `${url.protocol}//${url.hostname}${url.pathname}`.replace(/\/$/, '');
  } catch (error) {
    // If URL is invalid, return it as is but cleaned up
    return urlString.split('?')[0].split('#')[0].replace(/\/$/, '');
  }
} 