import { test, expect } from "@playwright/test";
import { seedUser } from "../fixtures/test-data";

test.describe("Login feature", () => {
    test("should login successfully", async ({ page }) => {
        await page.goto("/login");

        await page.getByTestId("login-email").fill(seedUser.email);
        await page.getByTestId("login-password").fill(seedUser.password);
        await page.getByTestId("login-submit").click();

        await expect(page).toHaveURL("/");
        await expect(page.getByTestId("user-email")).toHaveText(seedUser.email);
    });
});