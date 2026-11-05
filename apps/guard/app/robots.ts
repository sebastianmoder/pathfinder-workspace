import type { MetadataRoute } from 'next';
import { products } from '@pathfinder/brand/products';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = products.find((product) => product.id === 'guard')!.url;

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
