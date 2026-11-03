import { spawnSync } from 'node:child_process';

// Netlify runs this before installing dependencies, using its own Node runtime.
// Exit 0 skips the build; exit 1 lets it continue.
const apps = new Set(['pathfinder', 'sage', 'guard', 'artisan']);
const app = process.argv[2];
const previous = process.env.CACHED_COMMIT_REF;
const current = process.env.COMMIT_REF;

function build(reason) {
  console.log(`[netlify-ignore] Build ${app}: ${reason}`);
  process.exit(1);
}

if (!apps.has(app)) build('unknown app; skipping is unsafe');
if (!previous || !current) build('commit history unavailable');
// Netlify sets both refs to the same commit for cache-cleared builds.
if (previous === current) build('same commit; allow an explicit rebuild');

const diff = spawnSync(
  'git',
  ['diff', '--name-only', '--no-renames', '--no-ext-diff', '--no-textconv', '-z', previous, current, '--'],
  { encoding: 'utf8' },
);
if (diff.error || diff.status !== 0) build('could not compare commits');

for (const path of diff.stdout.split('\0').filter(Boolean)) {
  // All workspace manifests and patches participate in the root installation.
  if (/^apps\/[^/]+\/package\.json$/.test(path) || /^apps\/[^/]+\/patches\//.test(path)) {
    build(`workspace dependency input changed: ${path}`);
  }
  if (path.startsWith(`apps/${app}/`)) build(`app file changed: ${path}`);

  // Other known apps are independent. Unknown paths conservatively rebuild all
  // sites, covering shared packages, scripts, root config and future build inputs.
  const otherApp = path.match(/^apps\/([^/]+)\//)?.[1];
  if (apps.has(otherApp)) continue;
  if (path.startsWith('docs/') || /^[^/]+\.md$/i.test(path)) continue;
  build(`shared or workspace file changed: ${path}`);
}

console.log(`[netlify-ignore] Skip ${app}: no relevant changes`);
process.exit(0);
