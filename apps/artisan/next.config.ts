import type { NextConfig } from 'next';
import { withPathfinder } from '@pathfinder/config/next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Retired pages keep working for old links: the intake and the password lookup no longer exist.
  async redirects() {
    return [
      { source: '/start', destination: '/missions/m01-foundations', permanent: true },
      { source: '/continue', destination: '/map', permanent: true },
    ];
  },
};

export default withPathfinder(nextConfig);
