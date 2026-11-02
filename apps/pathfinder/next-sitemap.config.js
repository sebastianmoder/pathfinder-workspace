/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://ai-pathfinder.eu",
  exclude: ["/icon.svg", "/favicon.ico", "/apple-icon.png", "/icon.ico", "/robots.txt", "/sitemap.xml"],
  generateRobotsTxt: true, // (optional)
  generateIndexSitemap: false, // (optional)
  outputDir: "app", // (optional)
  // ...other options
};
