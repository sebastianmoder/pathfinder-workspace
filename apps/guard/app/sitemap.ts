import type { MetadataRoute } from 'next';
import { products } from '@pathfinder/brand/products';
import { labMetas } from '@/content/labs';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = products.find((product) => product.id === 'guard')!.url;

  // History and settings are personal utilities rather than learning content.
  return ['', ...labMetas.map((lab) => `/lab/${lab.id}`)].map((path) => ({
    url: `${siteUrl}${path}`,
  }));
}
