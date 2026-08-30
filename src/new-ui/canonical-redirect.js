(function() {
  const githubUrl = 'https://xtian69420.github.io/movieIguess/';
  const quotaPattern = /Bandwidth Quota Exceeded|monthly quota for bandwidth|upgrade the billing plan/i;
  const localHosts = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1'
  ];

  function isFirebaseQuotaPage() {
    const host = window.location.hostname.toLowerCase();
    const isFirebaseHost = host === 'movie-i-guess.web.app' || host.endsWith('.web.app');
    const text = (document.body ? document.body.innerText : '') + ' ' + (document.title || '');
    return isFirebaseHost && quotaPattern.test(text);
  }

  function redirectToCanonical() {
    const currentHost = window.location.hostname.toLowerCase();
    const currentPath = window.location.pathname || '/';
    const isLocalHost = localHosts.includes(currentHost);
    const isHttp = window.location.protocol.startsWith('http');
    const isGitHubPage = currentHost === 'xtian69420.github.io' && currentPath.startsWith('/movieIguess');

    if (!isHttp || isLocalHost || isGitHubPage) {
      return;
    }

    if (currentHost === 'movie-i-guess.web.app' || currentHost.endsWith('.web.app')) {
      if (isFirebaseQuotaPage() || currentPath === '/' || currentPath === '') {
        window.location.replace(githubUrl);
      }
    }
  }

  redirectToCanonical();
  window.addEventListener('pageshow', redirectToCanonical);
})();
