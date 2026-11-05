import { products } from '@pathfinder/brand/products'

/** @returns {import('next').MetadataRoute.Robots} */
export default function robots() {
  const siteUrl = products.find(product => product.id === 'sage').url

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
