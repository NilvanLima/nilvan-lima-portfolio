import { APIRequestContext } from "@playwright/test";
import { seedUser } from "../fixtures/test-data";

export async function loginViaApi(request: APIRequestContext): Promise<string> {
    const response = await request.post("/auth/login", {
        data: { email: seedUser.email, password: seedUser.password },
    });
    const body = await response.json();
    return body.token;
};