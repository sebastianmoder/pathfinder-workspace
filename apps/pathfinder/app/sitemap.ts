import type { MetadataRoute } from "next";
import { products } from "@pathfinder/brand/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = products.find((product) => product.id === "pathfinder")!.url;

  return [{ url: siteUrl }];
}
