import { test, expect } from "@playwright/test";
import { seedProductInStock } from "../fixtures/test-data";

test.describe("API — Products", () => {
    test("list returns the pagination structure", async ({ request }) => {
        const response = await request.get("/products");
        const body = await response.json();

        expect(response.status()).toBe(200);
        expect(Array.isArray(body.items)).toBe(true);
        expect(body.pagination).toHaveProperty("total");
    });

    test("filter by category returns only products from the according category", async ({ request }) => {
        const response = await request.get(`/products?category=${seedProductInStock.category}`);
        const body = await response.json();

        for (const product of body.items) {
            expect(product.category).toBe(seedProductInStock.category);
        }
    });

    test("inexistent product returns 404", async ({ request }) => {
        const response = await request.get("/products/id-que-nao-existe");

        expect(response.status()).toBe(404);
    });
});