import { copyFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

// Requires librsvg's rsvg-convert and ImageMagick's magick.
const source = resolve('pathfinder-refined.svg');
const temp = mkdtempSync(join(tmpdir(), 'pathfinder-brand-'));
const png = join(temp, 'emblem.png');
execFileSync('rsvg-convert', ['-w', '512', '-h', '512', '-o', png, source]);
execFileSync('magick', [png, '-define', 'icon:auto-resize=64,48,32,16', join(temp, 'favicon.ico')]);
execFileSync('magick', [png, '-resize', '180x180', join(temp, 'apple-icon.png')]);
for (const app of ['pathfinder', 'sage', 'guard', 'artisan']) {
  const root = resolve('apps', app);
  mkdirSync(join(root, 'public/brand'), { recursive: true });
  copyFileSync(source, join(root, 'public/brand/pathfinder.svg'));
  copyFileSync(source, join(root, 'app/icon.svg'));
  copyFileSync(join(temp, 'favicon.ico'), join(root, 'app/favicon.ico'));
  copyFileSync(join(temp, 'apple-icon.png'), join(root, 'app/apple-icon.png'));
}
