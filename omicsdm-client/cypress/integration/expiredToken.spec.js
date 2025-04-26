describe("token expired", () => {
  it("try to view datasets", () => {

    cy.intercept("GET", `${Cypress.env("apiUrl")}/datasets/viewcols`, {
      fixture: "mocks/datasetsViewCols.json",
    }).as("cols");
    
    cy.loadData("datasets", Cypress.env("auth_expired"));
    cy.checkForSessionExpired();
  });

  // FIXME
  // auth_expired
  // needs to be added to project select
  // it("try to submit datasets", () => {

  //   cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/all`, {
  //     fixture: "mocks/projects.json",
  //   }).as("show");

  //   cy.login(Cypress.env("auth_expired"),"submitdatasets");
  //   cy.get("#project1").click();
  //   cy.checkForSessionExpired();
  // });

  // FIXME
  // auth_expired
  // needs to be added to project select
  // it("try to submit files", () => {

  //   cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/all`, {
  //     fixture: "mocks/projects.json",
  //   }).as("show");

  //   cy.login(Cypress.env("auth_expired"),"submitfiles");
  //   cy.get("#project1").click();
  //   cy.checkForSessionExpired();
  // });
});
