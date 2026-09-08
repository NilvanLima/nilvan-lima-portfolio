export const seedUser = {
    name: "QA Tester",
    email: "qa.tester@example.com",
    password: "Test@1234",
};

export const seedProductInStock = {
    name: "Teclado Mecânico RGB",
    category: "periféricos",
};

export const seedProductOutOfStock = {
    name: "Headset com Microfone",
    category: "áudio",
};

export function randomEmail(): string {
    return `qa.playwright.${Date.now()}@example.com`;
}