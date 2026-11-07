import type { MetadataRoute } from 'next';
import { products } from '@pathfinder/brand/products';
import { missions } from '@/content/missions';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = products.find((product) => product.id === 'artisan')!.url;

  // Session summaries depend on the current learner's progress.
  const paths = ['', '/map', ...missions.map((mission) => `/missions/${mission.id}`)];
  return paths.map((path) => ({ url: `${siteUrl}${path}` }));
}
