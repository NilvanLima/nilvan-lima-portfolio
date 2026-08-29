describe("Basic sanity", () => {
    it("Google opens correctly", () => {
        cy.visit("https://www.google.com/");
        cy.title().should('include', 'Google');
    });

    it("Wikipedia loads", () => {
        cy.visit("https://www.wikipedia.org");
        cy.get("h1").should("be.visible");
    });
});

