import { products } from '@pathfinder/brand/products'
import { generateStaticParamsFor } from 'nextra/pages'

/** @returns {Promise<import('next').MetadataRoute.Sitemap>} */
export default async function sitemap() {
  const siteUrl = products.find(product => product.id === 'sage').url
  // Use the same published content registry as the Nextra catch-all page.
  const pages = await generateStaticParamsFor('mdxPath')()

  return pages.map(({ mdxPath }) => {
    const path = mdxPath.filter(Boolean).map(encodeURIComponent).join('/')
    return { url: path ? `${siteUrl}/${path}` : siteUrl }
  })
}
