/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://ai-pathfinder.eu",
  generateRobotsTxt: true, // (optional)
  generateIndexSitemap: false, // (optional)
  outputDir: "app", // (optional)
  // ...other options
};
