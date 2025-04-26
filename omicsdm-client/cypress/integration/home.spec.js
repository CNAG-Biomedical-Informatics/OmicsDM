
describe("Home elements visible", () => {
    before(() => {
      cy.kcFakeLogin(Cypress.env("auth_user1"), "#/login/?redirect=/home");
    })

    it("header visible", () => {
      // cy.debug()
      cy.get(".navBar").should('be.visible')
    });

    it("sidebar visible", () => {
      cy.get('*[class^="sidenav"]').should('be.visible')
    });

    it("welcome message visible", () => {
      cy.get('.home_title > .MuiTypography-h4').should('be.visible').contains("3TR")
    });

    it("data warehouse logo visible", () => {
      cy.get("#logo").should('be.visible')
    });

    it("buttons submit/manage data visible", () => {
      cy.get('.MuiCardMedia-root').should('be.visible')
    });

    it("buttons submit data visible", () => {
      cy.findByText('Submit Data').should('exist').should("be.visible")
    });

    it("buttons rerouting correctly", () => {
      cy.findByText('Submit Data').click().location().should((loc) => {
         expect(loc.hash).to.eq("#/submission")
      })
    });
  });
