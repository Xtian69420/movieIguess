(function() {
  const canonicalUrl = 'https://xtian69420.github.io/movieIguess/';
  const canonicalOrigin = new URL(canonicalUrl).origin;
  const canonicalPath = new URL(canonicalUrl).pathname;
  const localHosts = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1'
  ];

  const isLocalHost =
    localHosts.includes(window.location.hostname);

  const isHttp =
    window.location.protocol.startsWith('http');

  const isCanonicalRoot =
    window.location.origin === canonicalOrigin &&
    (
      window.location.pathname === canonicalPath ||
      window.location.pathname === canonicalPath.replace(/\/$/, '')
    );

  if (
    isHttp &&
    !isLocalHost &&
    !isCanonicalRoot
  ) {
    window.location.replace(canonicalUrl);
  }
})();
