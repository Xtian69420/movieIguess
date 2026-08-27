(function() {
  const canonicalOrigin = 'https://movie-i-guess.web.app';
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
      window.location.pathname === '/' ||
      window.location.pathname === ''
    );

  if (
    isHttp &&
    !isLocalHost &&
    !isCanonicalRoot
  ) {
    window.location.replace(`${canonicalOrigin}/`);
  }
})();
