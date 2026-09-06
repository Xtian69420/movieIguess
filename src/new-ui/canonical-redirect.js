(function() {
  if (!/^https?:$/.test(window.location.protocol)) {
    return;
  }

  const githubHost = 'xtian69420.github.io';
  const firebaseHost = 'movie-i-guess.web.app';
  const githubProjectPath = '/movieIguess';
  const currentPath = window.location.pathname || '/';
  const isGithubPages = window.location.hostname.toLowerCase() === githubHost;
  const appPath = isGithubPages && currentPath.startsWith(githubProjectPath)
    ? currentPath.slice(githubProjectPath.length) || '/'
    : currentPath;
  const isHomePage = appPath === '/' || appPath === '/index.html';
  const targetOrigin = isGithubPages
    ? `https://${firebaseHost}`
    : window.location.origin;
  const targetPath = isHomePage && !isGithubPages ? appPath : '/';
  const targetUrl = `${targetOrigin}${targetPath}${window.location.search}${window.location.hash}`;
  const currentUrl = `${window.location.origin}${currentPath}${window.location.search}${window.location.hash}`;

  if (currentUrl !== targetUrl) {
    window.location.replace(targetUrl);
  }
})();
