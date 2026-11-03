module.exports = async () => {
  const { withPathfinder } = await import('@pathfinder/config/next');
  return withPathfinder({
    redirects() {
      return [{ source: '/about', destination: '/#consortium', permanent: true }];
    },
  });
};
