import { test, expect } from '@playwright/test';

test("Google opens correctly", async({ page }) => {
    await page.goto("https://www.google.com/");

    await expect(page).toHaveTitle(/Google/);
});

test("Wikipedia loads correctly", async({ page }) => {
    await page.goto("https://www.wikipedia.org");

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
