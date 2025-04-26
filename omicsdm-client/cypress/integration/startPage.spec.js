// Keeps on failing on Jenkins commented out for now

describe("Cypress", () => {
  before(() => {
    cy.visit(`${Cypress.config("baseUrl")}/#/`);
  });

  it("visits the app", () => {
    cy.get(".MuiBox-root > .MuiButtonBase-root").should("exist");
  });
});
