import {defineConfig, devices} from '@playwright/test';
import path from "path";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:4200";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3333";
const STORAGE_STATE = path.join(__dirname, "playwright/.auth/user.json")

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: FRONTEND_URL,
        trace: 'on-first-retry',
        headless: false,
    },

    projects: [
        {
            name: "setup",
            testMatch: /auth\.setup\.ts/,
        },
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },

        {
            name: "api",
            testDir: "./tests/api",
            use: {baseURL: BACKEND_URL},
        },
    ],

    webServer: process.env.CI ? undefined : [
        {
            command: 'npm run start --prefix frontend',
            url: FRONTEND_URL,
            reuseExistingServer: true,
            timeout: 120_000,
        },
        {
            command: "npm run start --prefix backend",
            url: `${BACKEND_URL}/health`,
            reuseExistingServer: true,
            timeout: 60_000,
        },
    ],
});