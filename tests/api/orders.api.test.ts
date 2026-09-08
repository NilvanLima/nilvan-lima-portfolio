import { test, expect } from "@playwright/test";
import { seedProductInStock } from "../fixtures/test-data";

const productId = `seed-${seedProductInStock.name}`;

test.describe("API — Orders", () => {
    test("checkout with empty cart returns 422", async ({ request }) => {
        const registerResponse = await request.post("/auth/register", {
            data: {
                name: "Checkout Vazio",
                email: `checkout-vazio-${Date.now()}@example.com`,
                password: "SenhaForte@123",
            },
        });
        const { token } = await registerResponse.json();

        const response = await request.post("/orders", {
            headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.status()).toBe(422);
    });

    test("checkout successfully decreases the stock and empties the cart", async ({ request }) => {
        const registerResponse = await request.post("/auth/register", {
            data: {
                name: "Checkout Sucesso",
                email: `checkout-sucesso-${Date.now()}@example.com`,
                password: "SenhaForte@123",
            },
        });
        const { token } = await registerResponse.json();
        const headers = { Authorization: `Bearer ${token}` };

        const beforeProduct = await (await request.get(`/products/${productId}`)).json();

        await request.post("/cart/items", { headers, data: { productId, quantity: 1 } });
        const checkoutResponse = await request.post("/orders", { headers });
        expect(checkoutResponse.status()).toBe(201);

        const afterProduct = await (await request.get(`/products/${productId}`)).json();
        expect(afterProduct.stock).toBe(beforeProduct.stock - 1);

        const cartAfter = await (await request.get("/cart", { headers })).json();
        expect(cartAfter.items).toHaveLength(0);
    });
});