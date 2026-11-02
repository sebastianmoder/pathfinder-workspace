import { fileURLToPath } from 'node:url';
export const workspaceRoot = fileURLToPath(new URL('../../', import.meta.url));
export function withPathfinder(config = {}) {
  return { ...config, outputFileTracingRoot: workspaceRoot,
    transpilePackages: [...(config.transpilePackages || []), '@pathfinder/brand', '@pathfinder/analytics'],
    turbopack: { ...config.turbopack, root: workspaceRoot } };
}
