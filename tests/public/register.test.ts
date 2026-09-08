import { test, expect } from "@playwright/test";
import { randomEmail } from "../fixtures/test-data";

test.describe("Register feature @smoke", () => {
    test("should register successfully", async ({ page }) => {
        await page.goto("/register");

        await page.getByTestId("register-name").fill("test-name");
        await page.getByTestId("register-email").fill(randomEmail());
        await page.getByTestId("register-password").fill("test1234");
        await page.getByTestId("register-submit").click();

        await expect(page).toHaveURL("/");
        await expect(page.getByTestId("toast-message")).toBeVisible();
        await expect(page.getByTestId("toast-message")).toHaveText("Conta criada com sucesso");
    });
});