export function normalizeUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    // Only normalize the protocol and hostname, keep the pathname as is
    return `${url.protocol}//${url.hostname}${url.pathname}${url.search}`;
  } catch (error) {
    // If URL is invalid, return it as is
    return urlString;
  }
} 