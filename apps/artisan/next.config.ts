import type { NextConfig } from 'next';
import { withPathfinder } from '@pathfinder/config/next';
const nextConfig: NextConfig = { cacheComponents: true, partialPrefetching: true };
export default withPathfinder(nextConfig);
