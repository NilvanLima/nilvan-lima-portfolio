import {test, expect} from "@playwright/test";
import {seedUser} from "../fixtures/test-data";

test.describe("registered user full journey", () => {
    test("registered user full journey", async ({ page }) => {
        await page.goto("/");
        await page.getByTestId("nav-login").click();

        await test.step("login in the app", async () => {
            await page.getByTestId("login-email").fill(seedUser.email);
            await page.getByTestId("login-password").fill(seedUser.password);
            await page.getByTestId("login-submit").click();
        });

        await test.step("add an item to the cart", async () => {
            await page.getByTestId("add-to-cart-btn-0").click();
        });

        await test.step("checkout cart item", async () => {
            await page.getByTestId("nav-cart").click();
            await page.getByTestId("go-to-checkout").click();
            await page.getByTestId("confirm-checkout").click();
        });

        await expect(page.getByTestId("order-status").first()).toHaveText("Pago");
        await expect(page.getByTestId("cart-badge")).not.toBeVisible();
    });
});