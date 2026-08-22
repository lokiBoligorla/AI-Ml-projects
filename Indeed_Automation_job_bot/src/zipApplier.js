/**
 * Handles the "1-Click Apply" process on ZipRecruiter detail pane.
 */
async function applyToZipJob(page, jobCard, index) {
    try {
        console.log(`[ZIP-APPLIER] Processing Job ${index+1}...`);
        
        // Ensure the job card is visible and click it
        await jobCard.scrollIntoViewIfNeeded();
        const viewButton = await jobCard.$("button[aria-label^='View']");
        if (viewButton) {
            await viewButton.click();
        } else {
            await jobCard.click();
        }

        // Wait for detail pane to load and check for 1-Click Apply
        const applyBtnSelector = "button[aria-label='1-Click Apply']";
        try {
            await page.waitForSelector(applyBtnSelector, { timeout: 8000 });
        } catch (e) {
            console.log("[ZIP-APPLIER] 1-Click Apply button not found or already applied.");
            return 'skipped';
        }

        const applyBtn = await page.$(applyBtnSelector);
        if (applyBtn) {
            console.log("[ZIP-APPLIER] Clicking 1-Click Apply...");
            await applyBtn.click();
            await page.waitForTimeout(3000);

            const submitBtn = await page.$("button:has-text('Submit')");
            if (submitBtn) {
                await submitBtn.click();
                console.log("[ZIP-APPLIER] Application submitted.");
                await page.waitForTimeout(2000);
            } else {
                console.log("[ZIP-APPLIER] Auto-submitted or no submit button needed.");
            }
            return true;
        }

        return false;
    } catch (e) {
        console.error(`[ZIP-APPLIER ERROR] Failed to apply: ${e.message}`);
        return false;
    }
}

module.exports = { applyToZipJob };
