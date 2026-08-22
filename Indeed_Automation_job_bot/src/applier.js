/**
 * Handles the "Easy Apply" process on Indeed if available.
 * 
 * Warning: Indeed apply flows are highly dynamic. This provides a structural
 * baseline for the standard flow (Name, Email, Resume). Custom forms will likely fail.
 * 
 * @param {object} page - Playwright page object
 * @param {object} profile - User profile data (name, email, resumePath)
 * @returns {boolean} True if application succeeded, False otherwise
 */
async function applyToJob(page, profile) {
    console.log(`[APPLIER] Attempting Easy Apply... waiting to click...`);
    
    // Very human-like initial read delay before clicking apply
    await page.randomWait(8000, 15000); 

    try {
        // Look for the "Apply now" button wrapper - Indeed uses various IDs and classes
        const applyButtonSelectors = [
            '#indeedApplyButton', 
            '.ia-IndeedApplyButton', 
            'button.jobsearch-IndeedApplyButton',
            'span.indeed-apply-widget'
        ];
        
        let applyButton = null;
        for (const selector of applyButtonSelectors) {
            applyButton = await page.$(selector);
            if (applyButton) break;
        }

        if (!applyButton) {
            console.log(`[APPLIER] Job does not support "Easy Apply" on this page. Checking for External Apply...`);
            
            // Look for "Apply on Company Site"
            const externalSelectors = [
                'a[href*="apply"]:has-text("Apply on company site")',
                'button:has-text("Apply on company site")',
                '#viewJobButtonLinkContainer a',
                '.ia-IndeedApplyButton--external'
            ];
            
            let externalButton = null;
            for (const selector of externalSelectors) {
                externalButton = await page.$(selector);
                if (externalButton) break;
            }

            if (externalButton) {
                console.log(`[APPLIER] External Apply button found. Navigating to external site...`);
                
                const target = await externalButton.getAttribute('target');
                let externalPage = page;

                if (target === '_blank') {
                    // Opens in new tab
                    const [newPage] = await Promise.all([
                        page.context().waitForEvent('page', { timeout: 15000 }).catch(() => null),
                        externalButton.click(),
                    ]);
                    if (newPage) {
                        externalPage = newPage;
                    } else {
                        console.warn(`[APPLIER] New tab did not open. Checking current page...`);
                    }
                } else {
                    // Opens in same tab
                    await Promise.all([
                        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}),
                        externalButton.click(),
                    ]);
                }

                await externalPage.waitForLoadState('domcontentloaded');
                console.log(`[APPLIER ASSISTANT] Switched to external site: ${externalPage.url()}`);
                
                // Check if Indeed is showing a login gate on the "external" page (often happens)
                const isIndeedPage = externalPage.url().includes('indeed.com');
                const hasLoginGate = await externalPage.$('h2:has-text("sign in"), div:has-text("sign in")').catch(() => null);
                
                if (isIndeedPage && hasLoginGate) {
                    console.log(`[APPLIER ASSISTANT] Detected Indeed login gate on external path. Solving...`);
                    await loginToIndeed(externalPage, profile);
                    await externalPage.randomWait(3000, 6000);
                }

                // Attempt to fill generic form on the external site
                const fillResult = await fillGenericForm(externalPage, profile);
                if (fillResult) {
                    console.log(`[APPLIER SUCCESS] -> Finished filling external form. User must submit.`);
                    return 'external_filled';
                } else {
                    console.log(`[APPLIER] External form filling was not applicable or failed.`);
                    return 'external_site';
                }
            }

            return 'external_site';
        }

        await applyButton.click({ force: true });
        console.log(`[APPLIER] Clicked Apply. Waiting for transition...`);
        await page.randomWait(6000, 10000); 

        // Check if we reached a success page immediately (One-Click Apply)
        const postClickUrl = page.url();
        if (postClickUrl.includes('apply/success') || postClickUrl.includes('applied')) {
            console.log(`[APPLIER SUCCESS] -> One-Click Apply detected via URL!`);
            return true;
        }

        const successText = await page.evaluate(() => {
            const body = document.body.innerText;
            return body.includes('Application Submitted') || body.includes('Successfully Applied');
        });

        if (successText) {
            console.log(`[APPLIER SUCCESS] -> One-Click Apply detected via page text!`);
            return true;
        }

        // Check if we are blocked by a login/security page OR a sign-in modal
        const currentUrl = page.url();
        const hasLoginModal = await page.$('h2:has-text("sign in"), div:has-text("sign in"):has-text("before applying")').catch(() => null);

        if (currentUrl.includes('account/login') || currentUrl.includes('auth/') || hasLoginModal) {
            console.warn(`[APPLIER] Login prompt detected. Attempting automated login...`);
            const loginResult = await loginToIndeed(page, profile);
            if (loginResult !== true) {
                console.warn(`[APPLIER WARNING] Automated login failed or requires manual action.`);
                return 'manual_action';
            }
            console.log(`[APPLIER] Login successful. Continuing with application...`);
            await page.randomWait(5000, 8000);
        }

        // Wait for modal or new frame
        // Indeed forms can be in a modal iframe or a flat page.
        const iframeElement = await page.waitForSelector('iframe[title*="Job"], iframe[id*="indeed"], iframe', { timeout: 15000 }).catch(() => null);
        
        if (!iframeElement) {
             console.log(`[APPLIER] Could not find application iFrame. Checking for flat page...`);
             // If no iframe, maybe it's a direct page. We'll try to use 'page' directly if we see form elements.
        }
        
        let frame = iframeElement ? await iframeElement.contentFrame() : page;
        if (!frame) {
            console.log('[APPLIER] Cannot access application frame content.');
            return false;
        }

        // STEP 1: CONTACT INFO (Name, Email)
        console.log(`[APPLIER] Filling Contact Info slowly...`);
        
        // Wait for any input to ensure frame is ready
        await frame.waitForSelector('input', { timeout: 10000 }).catch(() => {});

        const nameInput = await frame.$('input[name="applicant.name"], #input-applicant-name');
        if (nameInput) {
            await nameInput.click();
            await nameInput.fill(profile.name, { delay: 180 }); 
        }
        await page.randomWait(3000, 5000);
        
        const emailInput = await frame.$('input[name="applicant.email"], #input-applicant-email');
        if (emailInput) {
            await emailInput.click();
            await emailInput.fill(profile.email, { delay: 180 });
        }
        
        await page.randomWait(4000, 7000); 
        const continueBtn = await frame.$('button:has-text("Continue"), button:has-text("Next")');
        if (continueBtn) {
            await continueBtn.click({ force: true });
            await page.randomWait(5000, 9000);
        }
        
        // Handling subsequent steps loop
        let maxSteps = 8;
        while(maxSteps > 0) {
            // Check for success or final submit
            const submitBtn = await frame.$('button:has-text("Submit application")');
            if (submitBtn) {
                console.log(`[APPLIER] Reached final review page. Reviewing...`);
                await page.randomWait(8000, 15000); 
                await submitBtn.click({ force: true });
                console.log(`[APPLIER SUCCESS] -> Clicked Submit!`);
                await page.randomWait(5000, 8000); // Wait to see success message
                return true;
            }

            // Check for more 'Continue' buttons
            const btnContinue = await frame.$('button:has-text("Continue"), button:has-text("Next")');
            if(btnContinue) {
                // If there's a file input, try to upload if we haven't
                const fileInput = await frame.$('input[type="file"]');
                if (fileInput && profile.resumePath) {
                     console.log(`[APPLIER] Found resume upload...`);
                     await fileInput.setInputFiles(profile.resumePath).catch(() => {});
                     await page.randomWait(5000, 8000);
                }

                console.log(`[APPLIER] Clicking Continue...`);
                await btnContinue.click({ force: true });
                await page.randomWait(5000, 9000);
            } else {
                // No continue and no submit? Maybe a complex question or login
                console.log(`[APPLIER] No "Continue" or "Submit" button found. Possible manual intervention needed.`);
                break;
            }
            maxSteps--;
        }

        console.log(`[APPLIER] Application stalled. Manual intervention might be needed.`);
        return 'manual_action';

    } catch (e) {
        console.error(`[APPLIER ERROR] Application flow failed:`, e.message);
        return false;
    }
}

/**
 * Attempts to log in to Indeed using provided profile credentials.
 * 
 * @param {object} page - Playwright page object
 * @param {object} profile - User profile data (email, password)
 * @returns {boolean} True if login seems successful, False or 'manual_action' otherwise
 */
async function loginToIndeed(page, profile) {
    try {
        console.log(`[LOGIN] Attempting login automation...`);

        // Helper to find element in page OR any iframe OR any popup window
        const findInFrames = async (selector) => {
            // 1. Check main page
            let mainEl = await page.$(selector).catch(() => null);
            if (mainEl && await mainEl.isVisible()) return { element: mainEl, target: page };

            // 2. Check all frames in main page
            for (const frame of page.frames()) {
                if (frame.isDetached()) continue;
                const frameEl = await frame.$(selector).catch(() => null);
                if (frameEl && await frameEl.isVisible()) return { element: frameEl, target: frame };
            }

            // 3. Check all other pages (popups) in the context
            const allPages = page.context().pages();
            for (const p of allPages) {
                if (p === page || p.isClosed()) continue;
                
                // Try to see if this page is a Google Login page
                const title = await p.title().catch(() => "");
                const url = p.url();
                if (title.includes("Google") || url.includes("accounts.google.com")) {
                    const popupEl = await p.$(selector).catch(() => null);
                    if (popupEl && await popupEl.isVisible()) return { element: popupEl, target: p };
                }
            }
            
            return null;
        };

        // --- STEP 0: Check for "Sign in with Google" button if we are not already on Google ---
        const googleSignBtnSelectors = [
            'button:has-text("Sign in with Google")',
            'div[role="button"]:has-text("Sign in with Google")',
            '.gsi-material-button'
        ];
        
        const currentUrl = page.url();
        if (!currentUrl.includes('google.com')) {
            for (const sel of googleSignBtnSelectors) {
                const btnResult = await findInFrames(sel);
                if (btnResult) {
                    console.log(`[LOGIN] Found "Sign in with Google" button. Clicking...`);
                    await btnResult.element.click();
                    await page.randomWait(5000, 8000); // Wait for popup
                    break;
                }
            }
        }

        // --- STEP 1: EMAIL ---
        const emailSelectors = [
            'input[type="email"]',
            'input[name="email"]',
            'input[name="identifier"]',
            '#ifl-InputFormField-3',
            '#identifierId',
            'input[aria-label*="email"]'
        ];

        let emailResult = null;
        for (const sel of emailSelectors) {
            emailResult = await findInFrames(sel);
            if (emailResult) {
                console.log(`[LOGIN] Found email field using: ${sel}`);
                break;
            }
        }

        if (!emailResult) {
            console.error(`[LOGIN ERROR] Could not find email input field.`);
            return 'manual_action';
        }

        const { element: emailInput, target: emailFrame } = emailResult;
        console.log(`[LOGIN] Filling email: ${profile.email}`);
        await emailInput.click();
        await emailInput.fill(profile.email, { delay: 150 });
        await page.randomWait(3000, 5000); // Wait for potential validation

        // Click Continue/Next
        const nextSelectors = [
            'button[type="submit"]',
            'button:has-text("Continue")',
            'button:has-text("Next")',
            '#identifierNext',
            '.ia-ContinueButton',
            'span:has-text("Continue")',
            'button[data-testid="continue-button"]',
            'button.icl-Button--primary',
            'button.ia-continue',
            'button:has-text("continue")',
            '[aria-label*="Continue"]',
            'button:has(span:has-text("Continue"))',
            'div#identifierNext button',
            'div#passwordNext button',
            '#identifierNext button',
            '#passwordNext button'
        ];

        let nextResult = null;
        for (const sel of nextSelectors) {
            nextResult = await findInFrames(sel);
            if (nextResult) {
                console.log(`[LOGIN] Found Next/Continue button using: ${sel}`);
                break;
            }
        }

        if (!nextResult) {
            console.error(`[LOGIN ERROR] Could not find "Next/Continue" button.`);
            return 'manual_action';
        }
        console.log(`[LOGIN] Clicking Continue/Next...`);
        await nextResult.element.click({ force: true });
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.randomWait(4000, 7000);

        // --- STEP 2: PASSWORD (if requested) ---
        const passwordSelectors = [
            'input[type="password"]',
            'input[name="password"]',
            '#ifl-InputFormField-112'
        ];

        let passwordResult = null;
        for (const sel of passwordSelectors) {
            passwordResult = await findInFrames(sel);
            if (passwordResult) break;
        }

        if (passwordResult) {
            if (profile.password) {
                console.log(`[LOGIN] Filling password...`);
                await passwordResult.element.click();
                await passwordResult.element.fill(profile.password, { delay: 150 });
                await page.randomWait(2000, 4000);

                const signInSelectors = [
                    'button[type="submit"]',
                    'button:has-text("Sign in")',
                    'button:has-text("Next")',
                    '#passwordNext'
                ];

                let signInResult = null;
                for (const sel of signInSelectors) {
                    signInResult = await findInFrames(sel);
                    if (signInResult) break;
                }

                if (signInResult) {
                    await signInResult.element.click({ force: true });
                    await page.randomWait(8000, 12000);
                }
            } else {
                console.warn(`[LOGIN] Password requested but none provided in dashboard.`);
                return 'manual_action';
            }
        }

        return true;
    } catch (e) {
        console.error(`[LOGIN ERROR] Exception during login:`, e.message);
        return 'manual_action';
    }
}

/**
 * Best-effort function to fill common fields on an external job application page.
 * 
 * @param {object} page - Playwright page object (external site)
 * @param {object} profile - User profile data
 * @returns {boolean} True if any field was filled, False otherwise
 */
async function fillGenericForm(page, profile) {
    try {
        console.log(`[ASSISTANT] Inspecting external form fields...`);
        await page.randomWait(3000, 6000);

        let fieldsFilled = 0;

        // Common selectors for typical form fields
        const selectors = {
            name: ['input[name*="name"]', 'input[id*="name"]', 'input[placeholder*="Name"]'],
            email: ['input[name*="email"]', 'input[id*="email"]', 'input[type="email"]'],
            phone: ['input[name*="phone"]', 'input[id*="phone"]', 'input[type="tel"]'],
            resume: ['input[type="file"][accept*="pdf"]', 'input[id*="resume"]', 'input[name*="resume"]']
        };

        // Fill Name
        for (const sel of selectors.name) {
            const el = await page.$(sel);
            if (el && await el.isVisible()) {
                await el.fill(profile.name, { delay: 100 });
                fieldsFilled++;
                break;
            }
        }

        // Fill Email
        for (const sel of selectors.email) {
            const el = await page.$(sel);
            if (el && await el.isVisible()) {
                await el.fill(profile.email, { delay: 100 });
                fieldsFilled++;
                break;
            }
        }

        // Upload Resume
        if (profile.resumePath) {
            for (const sel of selectors.resume) {
                const el = await page.$(sel);
                if (el && await el.isVisible()) {
                    await el.setInputFiles(profile.resumePath).catch(() => {});
                    fieldsFilled++;
                    break;
                }
            }
        }

        return fieldsFilled > 0;
    } catch (e) {
        console.error(`[ASSISTANT ERROR] Failed to fill external form:`, e.message);
        return false;
    }
}

module.exports = { applyToJob };
