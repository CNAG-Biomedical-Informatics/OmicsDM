Cypress.Commands.add("readInstructions", (page) => {
  cy.findByText("Instructions")
    .should("exist")
    .should("be.visible")
    .click();
  cy.findByText(`How to submit ${page}`)
    .should("exist")
    .should("be.visible");
  cy.get(".explanation").should("be.visible")
  cy.get("body").click(0,0);
  cy.get(".explanation").should("not.be.visible")
});

describe("instructions", () => {

  beforeEach(() => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/all`, {
      fixture: "mocks/projects.json",
    }).as("show");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/all`, {
      fixture: "mocks/datasets.json",
    }).as("show");
  });

  // flaky on jenkins
  // therefore we skip this test

  // it("dataset submission instructions", () => {
  //   cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/submissioncols?arg=disease`, {
  //     fixture: "mocks/datasetSubmissionCols_diseases.json",
  //   }).as("show");

  //   cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/submissioncols?arg=visibility`, {
  //     fixture: "mocks/datasetSubmissionCols_visibility.json",
  //   }).as("show");

  //   cy.login(Cypress.env("auth_user1"), "submitdatasets");
  //   cy.get("#project1").click();
  //   cy.readInstructions("datasets");
  // });

  it("file submission instructions", () => {

    cy.intercept("GET", `${Cypress.env("apiUrl")}/files/submissioncols`, {
      fixture: "mocks/fileSubmissionCols.json",
    }).as("cols");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/list`, {
      fixture: "mocks/datasetIDs.json",
    });

    cy.login(Cypress.env("auth_user1"), "uploadfiles/selectproject");
    cy.get("#project1").click();
    cy.readInstructions("files");
  });
});
