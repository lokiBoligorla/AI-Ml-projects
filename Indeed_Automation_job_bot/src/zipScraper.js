/**
 * Navigates to ZipRecruiter, performs a search based on role and location,
 * applies filters, and extracts job article elements.
 */
async function scrapeZipJobLinks(page, role, location, profile) {
    console.log(`[ZIP-SCRAPER] Searching for "${role}" in "${location}"...`);
    
    // Step 1: Login if needed
    await page.goto("https://www.ziprecruiter.com", { waitUntil: 'domcontentloaded' });
    
    const searchBar = await page.$("#search-bar");
    if (!searchBar) {
        console.log("[ZIP-SCRAPER] Not logged in. Navigating to login...");
        await page.goto("https://www.ziprecruiter.com/authn/login", { waitUntil: 'domcontentloaded' });
        
        await page.waitForSelector("input[name='email']", { timeout: 10000 });
        await page.fill("input[name='email']", profile.email);
        await page.click("[data-testid='reg-base-form-submit']");
        
        console.log("[ZIP-SCRAPER] Waiting for manual OTP entry/login completion (300s)...");
        try {
            await page.waitForSelector("#search-bar", { timeout: 300000 });
            console.log("[ZIP-SCRAPER] Login successful.");
        } catch (e) {
            console.error("[ZIP-SCRAPER] Login timeout or failed.");
            return [];
        }
    } else {
        console.log("[ZIP-SCRAPER] Already logged in.");
    }

    // Step 2: Search
    await page.fill("[data-testid='zds-header-title-input']", role);
    await page.fill("[data-testid='zds-header-location-input']", location);
    await page.click("[data-testid='submit-button']");
    await page.waitForLoadState("networkidle");

    // Step 3: Apply Filters
    console.log("[ZIP-SCRAPER] Applying filters...");
    await page.click("#zds-header-filters-button");
    await page.waitForSelector("h4:has-text('Apply type')");

    await page.locator("label:has-text('Quick apply only')").click();
    await page.locator("[aria-label='100mi+']").click();
    await page.locator("label:has-text('Within 10 days')").click();
    await page.locator("label:has-text('Contract')").click();

    try {
        await page.locator("button:has-text('Apply')").click();
    } catch (e) {
        // Apply button might not be needed if filters apply instantly
    }
    await page.waitForLoadState("networkidle");
    console.log("[ZIP-SCRAPER] Filters applied.");

    // Step 4: Extract job card metadata/elements
    // We'll return the page object and the count of jobs to process 
    // because ZipRecruiter uses a two-pane view where we click each card.
    await page.waitForSelector("article[id^='job-card-']", { timeout: 15000 });
    const jobCards = await page.$$("article[id^='job-card-']");
    console.log(`[ZIP-SCRAPER] Found ${jobCards.length} job cards.`);
    
    return jobCards;
}

module.exports = { scrapeZipJobLinks };
