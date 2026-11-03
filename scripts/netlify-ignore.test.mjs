import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('./netlify-ignore.mjs', import.meta.url));
const apps = ['pathfinder', 'sage', 'guard', 'artisan'];

test('Netlify skips only apps unaffected by the full commit range', async (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'pathfinder-netlify-ignore-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));

  function git(...args) {
    return execFileSync('git', [
      '-c', 'user.name=Build ignore test', '-c', 'user.email=build-test@example.invalid',
      '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args,
    ], { cwd, encoding: 'utf8' }).trim();
  }

  let sequence = 0;
  function change(path) {
    mkdirSync(dirname(join(cwd, path)), { recursive: true });
    writeFileSync(join(cwd, path), `fixture ${sequence++}\n`);
  }

  function commit() {
    git('add', '--all');
    git('commit', '--quiet', '-m', 'Build ignore fixture');
    return git('rev-parse', 'HEAD');
  }

  function expectBuilds(previous, current, expected, appNames = apps) {
    for (const app of appNames) {
      const result = spawnSync(process.execPath, [script, app], {
        cwd,
        encoding: 'utf8',
        env: { ...process.env, CACHED_COMMIT_REF: previous, COMMIT_REF: current },
      });
      assert.equal(result.status, expected.includes(app) ? 1 : 0, `${app}: ${result.stdout}${result.stderr}`);
    }
  }

  git('init', '--quiet');
  change('README.md');
  let current = commit();

  for (const [name, paths, expected] of [
    ['SAGE content', ['apps/sage/content/lesson.mdx'], ['sage']],
    ['GUARD functions', ['apps/guard/netlify/functions/chat-worker.mts'], ['guard']],
    ['two apps', ['apps/pathfinder/app/page.tsx', 'apps/artisan/app/page.tsx'], ['pathfinder', 'artisan']],
    ['shared packages', ['packages/brand/index.tsx'], apps],
    ['lockfile', ['pnpm-lock.yaml'], apps],
    ['workspace config', ['pnpm-workspace.yaml', '.nvmrc', '.npmrc', 'package.json'], apps],
    ['another app manifest', ['apps/sage/package.json'], apps],
    ['workspace patch inside SAGE', ['apps/sage/patches/theme.patch'], apps],
    ['build scripts', ['scripts/netlify-ignore.mjs'], apps],
    ['new shared input', ['future-config/settings.json'], apps],
    ['documentation', ['docs/cutover.md', 'README.md', 'AGENTS.md'], []],
  ]) {
    await t.test(name, () => {
      const previous = current;
      paths.forEach(change);
      current = commit();
      expectBuilds(previous, current, expected);
    });
  }

  await t.test('includes changes across multiple commits since the last build', () => {
    const previous = current;
    change('apps/guard/app/page.tsx');
    commit();
    change('docs/notes.md');
    current = commit();
    expectBuilds(previous, current, ['guard']);
  });

  await t.test('renames between apps rebuild both; deleted files rebuild their app', () => {
    const previous = current;
    mkdirSync(join(cwd, 'apps/artisan/content'), { recursive: true });
    renameSync(join(cwd, 'apps/sage/content/lesson.mdx'), join(cwd, 'apps/artisan/content/lesson.mdx'));
    current = commit();
    expectBuilds(previous, current, ['sage', 'artisan']);
    const beforeDelete = current;
    rmSync(join(cwd, 'apps/artisan/content/lesson.mdx'));
    current = commit();
    expectBuilds(beforeDelete, current, ['artisan']);
  });

  await t.test('first builds, cache-cleared rebuilds and invalid history always build', () => {
    expectBuilds('', current, apps);
    expectBuilds(current, '', apps);
    expectBuilds(current, current, apps);
    expectBuilds('missing-commit', current, apps);
    expectBuilds(current, 'missing-commit', apps);
    expectBuilds(current, current, ['unknown'], ['unknown']);
  });
});
