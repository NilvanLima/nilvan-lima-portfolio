import {test, expect} from "@playwright/test";
import {seedUser, randomEmail} from "../fixtures/test-data";

test.describe("API — Auth", () => {
    test("register with valid data returns 201 and a token", async ({request}) => {
        const response = await request.post("/auth/register", {
            data: {
                name: "API Test",
                email: randomEmail(),
                password: "SenhaForte@123"
            },
        });
        const body = await response.json();

        expect(response.status()).toBe(201);
        expect(body.token).toBeTruthy();
        expect(body.user.email).toBeTruthy();
    });

    test("register with an already registered e-mail returns 409", async ({request}) => {
        const response = await request.post("/auth/register", {
            data: {
                name: "Duplicado",
                email: seedUser.email,
                password: "QualquerSenha123"
            },
        });

        expect(response.status()).toBe(409);
    });

    test("register with invalid payload returns 400", async ({request}) => {
        const response = await request.post("/auth/register", {
            data: {
                name: "A",
                email: "nao-e-email",
                password: "123"
            },
        });
        expect(response.status()).toBe(400);
    });

    test("login with correct credentials returns 200 and a token", async ({request}) => {
        const response = await request.post("/auth/login", {
            data: {
                email: seedUser.email,
                password: seedUser.password
            },
        });
        const body = await response.json();

        expect(response.status()).toBe(200);
        expect(body.token).toBeTruthy();
    });

    test("login with wrong password returns 401", async ({request}) => {
        const response = await request.post("/auth/login", {
            data: {
                email: seedUser.email,
                password: "senha-errada"
            },
        });

        expect(response.status()).toBe(401);
    });
});