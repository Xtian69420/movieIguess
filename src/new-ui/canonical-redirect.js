(function() {
  const redirectToFirebase = true;
  const githubHost = 'xtian69420.github.io';
  const firebaseHost = 'movie-i-guess.web.app';
  const githubProjectPath = '/movieIguess';

  if (
    !redirectToFirebase ||
    window.location.hostname.toLowerCase() !== githubHost
  ) {
    return;
  }

  const currentPath = window.location.pathname || '/';
  const appPath = currentPath.startsWith(githubProjectPath)
    ? currentPath.slice(githubProjectPath.length) || '/'
    : currentPath;

  window.location.replace(
    `https://${firebaseHost}${appPath}${window.location.search}${window.location.hash}`
  );
})();
