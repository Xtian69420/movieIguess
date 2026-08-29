const SHRTFLY_API_KEY = '49133b9f80da6384b51879d17190248c';
const SHRTFLY_API_URL = 'https://shrtfly.com/api';

// Cache shortened URLs for the current page session so repeated clicks do not
// create unnecessary duplicate ShrtFly links.
const shortenedUrlCache = new Map();

/**
 * Convert a destination URL into a ShrtFly monetized URL.
 *
 * NOTE: The API key is intentionally hardcoded for local testing only.
 * Move this request to a server-side endpoint before publishing the site.
 */
export async function createShrtFlyUrl(originalUrl) {
  if (!originalUrl) {
    throw new Error('Missing original URL.');
  }

  const destination = new URL(originalUrl, window.location.href);

  if (!['http:', 'https:'].includes(destination.protocol)) {
    throw new Error('Unsupported destination URL.');
  }

  const normalizedUrl = destination.href;

  if (shortenedUrlCache.has(normalizedUrl)) {
    return shortenedUrlCache.get(normalizedUrl);
  }

  const params = new URLSearchParams({
    api: SHRTFLY_API_KEY,
    type: '1',
    url: normalizedUrl,
    format: 'json'
  });

  const response = await fetch(`${SHRTFLY_API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`ShrtFly HTTP error: ${response.status}`);
  }

  const data = await response.json();

  if (data?.status !== 'success') {
    throw new Error(
      typeof data?.result === 'string'
        ? data.result
        : 'ShrtFly could not shorten this URL.'
    );
  }

  const shortUrl = data?.result?.shorten_url;

  if (!shortUrl) {
    throw new Error('ShrtFly did not return a shortened URL.');
  }

  shortenedUrlCache.set(normalizedUrl, shortUrl);
  return shortUrl;
}
