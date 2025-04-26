describe("faq page", () => {
  beforeEach(() => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/all`, {
      fixture: "mocks/projects.json",
    }).as("show");

    cy.login(Cypress.env("auth_user1"), "");
  });

  it("open faq page via url", () => {
    cy.visit(`${Cypress.config("baseUrl")}/#/faq`);
  });

  it("go to faq via navbar", () => {
    cy.get(":nth-child(3) > .MuiButton-label > a")
      .click()
      .location("hash")
      .should("be.eq", "#/faq");
  });
  
  it("click on 1. Create Dataset", () => {
    cy.get(":nth-child(3) > .MuiButton-label > a").click()
    cy.get("[data-cy=step1]").rerouteWithButton("#/createdatasets/selectproject");
  });

  it("click on 2. Upload Files", () => {    
    cy.get(":nth-child(3) > .MuiButton-label > a").click()
    cy.get("[data-cy=step2]").rerouteWithButton("#/uploadfiles/selectproject");
  });

  it("click in Create Dataset on 'here' - datasetsView1", () => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/all`, {
      fixture: "mocks/datasets.json",
    }).as("show");

    cy.intercept("GET", `${Cypress.env("apiUrl")}/datasets/viewcols`, {
      fixture: "mocks/datasetsViewCols.json",
    }).as("cols");

    cy.get(":nth-child(3) > .MuiButton-label > a").click()
    cy.get("[data-cy=datasetsView1]").rerouteWithButton("#/datasets");
  });

  it("click in Create Dataset on 'here' - datasetsView2", () => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/all`, {
      fixture: "mocks/datasets.json",
    }).as("show");

    cy.intercept("GET", `${Cypress.env("apiUrl")}/datasets/viewcols`, {
      fixture: "mocks/datasetsViewCols.json",
    }).as("cols");

    cy.get(":nth-child(3) > .MuiButton-label > a").click()
    cy.get("[data-cy=datasetsView2]").rerouteWithButton("#/datasets");
  });

  it("click in Upload Files on 'here' - filesView", () => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/all`, {
      fixture: "mocks/datasets.json",
    });

    cy.intercept("GET", `${Cypress.env("apiUrl")}/datasets/viewcols`, {
      fixture: "mocks/datasetsViewCols.json",
    }).as("cols");

    cy.get(":nth-child(3) > .MuiButton-label > a").click()
    cy.get("[data-cy=filesView]").rerouteWithButton("#/datasets");
  });
});
