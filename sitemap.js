const fs = require('fs');
const prettier = require('prettier');

async function generateSitemap() {
    try {
        // Define your static routes
        const staticPages = [
            '',              // Home page
            '/about',        // About page
            '/contact',      // Contact page
            '/donate',       // Donate page
            '/projects',     // Projects listing page
        ];

        // Your website URL
        const baseUrl = 'https://smileofcompassion.org'; // Update this to your actual domain

        // Generate sitemap XML content
        const sitemap = `
            <?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                ${staticPages
                    .map((path) => {
                        return `
                            <url>
                                <loc>${baseUrl}${path}</loc>
                                <lastmod>${new Date().toISOString()}</lastmod>
                                <changefreq>weekly</changefreq>
                                <priority>${path === '' ? '1.0' : '0.8'}</priority>
                            </url>
                        `;
                    })
                    .join('')}
            </urlset>
        `;

        // Format the XML
        const formatted = await prettier.format(sitemap, {
            parser: 'html',
        });

        // Ensure public directory exists
        if (!fs.existsSync('public')) {
            fs.mkdirSync('public');
        }

        // Write the sitemap file
        fs.writeFileSync('public/sitemap.xml', formatted);
        
        // Generate robots.txt
        const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;
        
        fs.writeFileSync('public/robots.txt', robotsTxt.trim());

        console.log('Sitemap and robots.txt generated successfully!');
    } catch (error) {
        console.error('Error generating sitemap:', error);
    }
}

// Execute the async function
generateSitemap().catch(console.error);
