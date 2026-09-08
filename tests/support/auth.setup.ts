import { test as setup, request } from "@playwright/test";
import fs from "fs";
import path from "path";
import { seedUser} from "../fixtures/test-data";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3333";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:4200";

export const AUTH_FILE = path.join(__dirname, "../../playwright/.auth/user.json");

setup("authenticate as seed user via API", async () => {
    const apiContext = await request.newContext({ baseURL: BACKEND_URL });

    const response = await apiContext.post("/auth/login", {
        data: { email: seedUser.email, password: seedUser.password },
    });

    if(!response.ok) {
        throw new Error(`Failed to authenticate the seed user via API (status ${response.status()}).
            Confirm that backend is running and "npm run seed" was executed`,
        );
    }

    const body = await response.json();

    const storageState = {
        cookies: [],
        origins: [{
            origin: FRONTEND_URL,
            localStorage: [
                { name: "qa_store_token", value: body.token },
                { name: "qa_store_user", value: JSON.stringify(body.user) },
            ]
        }]
    };

    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    fs.writeFileSync(AUTH_FILE, JSON.stringify(storageState, null, 2 ));

    await apiContext.dispose();
});