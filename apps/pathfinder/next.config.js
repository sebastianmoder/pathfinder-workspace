module.exports = async () => {
  const { withPathfinder } = await import('@pathfinder/config/next');
  const { products } = await import('@pathfinder/brand/products');
  return withPathfinder({
    redirects() {
      return [
        { source: '/about', destination: '/#consortium', permanent: true },
        ...products.filter(product => product.id !== 'pathfinder').map(product => ({
          source: `/${product.id}`,
          destination: product.url,
          permanent: true,
        })),
      ];
    },
  });
};
