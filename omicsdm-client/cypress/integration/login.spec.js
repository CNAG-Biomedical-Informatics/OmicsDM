describe("Keycloak Login", () => {
  
  it("test login", () => {
    cy.login(Cypress.env("auth_user1"), "submission");
    cy.window().its('Cypress').should('be.an', 'object')
    cy.location("hash").should("be.eq", "#/submission");
    cy.get(".container > .MuiGrid-container").should("exist");
    cy.screenshot()
  });

  it("test login admin", () => {
    window.localStorage.setItem('kcGroup', "admin");

    cy.login(Cypress.env("auth_admin"), "submission");
    cy.window().its('Cypress').should('be.an', 'object')
    cy.location("hash").should("be.eq", "#/submission");
    cy.get(".container > .MuiGrid-container").should("exist");
    cy.screenshot()
  });
});
