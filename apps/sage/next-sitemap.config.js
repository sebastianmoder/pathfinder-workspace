/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://sage.ai-pathfinder.eu',
    generateRobotsTxt: true, // (optional)
    generateIndexSitemap: false, // (optional)
    outputDir: 'public', // (optional)
    // Drafts live outside content/. Keep former draft routes out if stale build
    // output survives in an incremental deployment.
    exclude: [
        '/aitools',
        '/casereports',
        '/teachertraining',
        '/students/promptathon',
        '/teaching/admin_work',
    ],
    // ...other options
}
