import { test, expect } from "@playwright/test";
import { loginViaApi } from "../support/api-client";
import { seedProductInStock } from "../fixtures/test-data";

const productId = `seed-${seedProductInStock.name}`;

test.describe("API — Cart", () => {
    test("access the cart without a token returns 401", async ({request}) => {
        const response = await request.get("/cart");

        expect(response.status()).toBe(401);
    });

    test("add an item with inexistent productId returns 404", async ({request}) => {
        const token = await loginViaApi(request);
        const response = await request.post("/cart/items", {
            headers: {Authorization: `Bearer ${token}`},
            data: {
                productId: "id-que-nao-existe",
                quantity: 1
            },
        });

        expect(response.status()).toBe(404);
    });

    test("add a valid item returns 201", async ({request}) => {
        const token = await loginViaApi(request);

        const response = await request.post("/cart/items", {
            headers: { Authorization: `Bearer ${token}`},
            data: {
                productId,
                quantity: 1
            },
        });

        expect(response.status()).toBe(201);
    });
});