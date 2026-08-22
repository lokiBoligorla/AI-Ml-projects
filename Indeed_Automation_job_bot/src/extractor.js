/**
 * Visits a specific Job URL and extracts the textual information (Title, Company, Description).
 * 
 * @param {object} page - Playwright page object
 * @param {string} url - Indeed job URL
 * @returns {object|null} { title, company, description } or null if failed
 */
async function extractJobDetails(page, url) {
    console.log(`[EXTRACTOR] Navigating to: ${url.split('?')[0]}...`);
    
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.randomWait(2000, 4000);

        // Check if Cloudflare, CAPTCHA, or 404
        const pageTitle = await page.title();
        if (pageTitle.includes('Attention Required') || pageTitle.includes('Security')) {
            console.error('[EXTRACTOR ERROR] Hit CAPTCHA block.');
            return null;
        }

        if (pageTitle.includes('Not Found') || pageTitle.includes('could not find')) {
            console.error('[EXTRACTOR ERROR] Indeed returned "Page Not Found". Skipping.');
            return null;
        }

        // Wait for main description container
        await page.waitForSelector('#jobDescriptionText', { timeout: 10000 });

        // Extract Title
        const title = await page.$eval('h1 > span', el => el.innerText.trim()).catch(() => 'Unknown Title');
        
        // Extract Company
        const company = await page.$eval('[data-company-name="true"]', el => el.innerText.trim()).catch(() => 'Unknown Company');
        
        // Extract Body/Description
        const description = await page.$eval('#jobDescriptionText', el => el.innerText.trim()).catch(() => '');

        console.log(`[EXTRACTOR] Successfully parsed: ${title} at ${company}`);

        return { title, company, description };

    } catch (e) {
        console.error(`[EXTRACTOR ERROR] Failed to extract ${url}:`, e.message);
        return null;
    }
}

module.exports = { extractJobDetails };
