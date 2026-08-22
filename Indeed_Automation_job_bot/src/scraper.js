/**
 * Navigates to Indeed, handles Cloudflare verification if detected,
 * and extracts all visible job URL links from the first page of results.
 * 
 * @param {object} page - Playwright page object
 * @param {string} role - The job role to search for
 * @param {string} location - The location to search in
 * @returns {Array<string>} List of job URLs
 */
async function scrapeJobLinks(page, role, location) {
    console.log(`[SCRAPER] Searching for "${role}" in "${location}"...`);
    
    // Construct direct search URL to bypass homepage form flakiness
    const searchUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(role)}&l=${encodeURIComponent(location)}`;
    
    // Navigate to Indeed
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    
    // Simple bot evasion delay
    await page.randomWait(3000, 5000);

    // --- CLOUDFLARE / ADDITIONAL VERIFICATION HANDLER ---
    // Wait up to 3 minutes for the user to solve Cloudflare if needed
    await waitForCloudflare(page, searchUrl);

    try {
        // Wait for search results container to load using a more robust selector
        // Indeed recently uses 'a.jcs-JobTitle' for all job links in the results
        await page.waitForSelector('a.jcs-JobTitle', { timeout: 20000 });
        await page.randomWait(2000, 4000); // Wait out visual load

        // Extract Links
        const links = await page.$$eval('a.jcs-JobTitle', (elements, baseUrl) => {
            return elements.map(el => {
                const href = el.getAttribute('href');
                if (!href) return null;
                
                // Ensure absolute URL
                let absoluteUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
                
                // Filter out obviously broken or irrelevant links
                // Indeed jobs usually have a 'jk=' param (Job Key)
                if (absoluteUrl.includes('jk=')) {
                    // Clean the URL to be simple
                    const urlObj = new URL(absoluteUrl);
                    const jk = urlObj.searchParams.get('jk');
                    return `https://www.indeed.com/viewjob?jk=${jk}`;
                }
                
                return null;
            }).filter(url => url !== null);
        }, 'https://www.indeed.com');

        console.log(`[SCRAPER] Found ${links.length} valid job URLs on the page.`);
        return [...new Set(links)]; // Remove duplicates

    } catch (e) {
        console.error(`[SCRAPER ERROR] Could not complete search:`, e.message);
        
        // Take a screenshot for debugging if it fails
        try {
            await page.screenshot({ path: './data/scraper-error.png' });
            console.log('[SCRAPER] Saved error screenshot to data/scraper-error.png');
        } catch (imgError) {
            // Ignore screenshot error
        }
        
        return [];
    }
}

/**
 * Detects Cloudflare / "Verify you are human" challenges and waits for the user
 * to solve them manually. After the challenge is solved and "Return Home" is
 * clicked (or the page navigates away on its own), this function re-navigates
 * to the original intended URL if needed.
 *
 * @param {object} page - Playwright page object
 * @param {string} intendedUrl - The URL we originally wanted to visit
 * @param {number} timeoutMs - Max time to wait (default: 3 minutes)
 */
async function waitForCloudflare(page, intendedUrl, timeoutMs = 180000) {
    const isChallengePage = async () => {
        try {
            const url = page.url();
            const title = await page.title().catch(() => '');
            const bodyText = await page.evaluate(() => document.body?.innerText || '').catch(() => '');

            const challengeSignals = [
                url.includes('challenges.cloudflare.com'),
                title.toLowerCase().includes('just a moment'),
                title.toLowerCase().includes('attention required'),
                bodyText.toLowerCase().includes('verify you are human'),
                bodyText.toLowerCase().includes('enable javascript and cookies'),
                bodyText.toLowerCase().includes('checking if the site connection is secure'),
                bodyText.toLowerCase().includes('additional verification required'),
                bodyText.toLowerCase().includes('complete the action below'),
            ];

            return challengeSignals.some(Boolean);
        } catch {
            return false;
        }
    };

    const isOnChallengePage = await isChallengePage();
    if (!isOnChallengePage) {
        // No challenge — proceed normally
        return;
    }

    console.log(`[CLOUDFLARE] ⚠️  Cloudflare/Verification challenge detected!`);
    console.log(`[CLOUDFLARE] 👤 Please solve the "Verify you are human" challenge in the browser.`);
    console.log(`[CLOUDFLARE] ⏳ Waiting up to ${timeoutMs / 1000} seconds for you to complete it...`);

    const startTime = Date.now();
    const pollInterval = 1500; // Check every 1.5 seconds

    while (Date.now() - startTime < timeoutMs) {
        await page.waitForTimeout(pollInterval);

        const stillOnChallenge = await isChallengePage();
        const currentUrl = page.url();

        if (!stillOnChallenge) {
            console.log(`[CLOUDFLARE] ✅ Challenge appears to be solved. Current URL: ${currentUrl}`);

            // If "Return Home" brought us to a generic homepage instead of our search URL,
            // re-navigate to the intended page.
            const isOnHomepage = (
                currentUrl === 'https://www.indeed.com/' ||
                currentUrl === 'https://www.indeed.com' ||
                currentUrl.endsWith('indeed.com/')
            );
            const isOnIntended = currentUrl.includes('/jobs?') || currentUrl === intendedUrl;

            if (!isOnIntended) {
                console.log(`[CLOUDFLARE] 🔄 Re-navigating to intended search URL after challenge...`);
                await page.waitForTimeout(2000);
                await page.goto(intendedUrl, { waitUntil: 'domcontentloaded' });
                await page.waitForTimeout(3000);
            } else {
                console.log(`[CLOUDFLARE] ✅ Already on the correct page. Continuing...`);
            }
            return;
        }

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        if (elapsed % 15 === 0) {
            console.log(`[CLOUDFLARE] Still waiting for challenge to be solved... (${elapsed}s elapsed)`);
        }
    }

    console.warn(`[CLOUDFLARE] ❌ Timed out waiting for Cloudflare challenge to be resolved after ${timeoutMs / 1000}s.`);
    console.warn(`[CLOUDFLARE] The bot will try to continue anyway — results may be empty.`);
}

module.exports = { scrapeJobLinks, waitForCloudflare };
