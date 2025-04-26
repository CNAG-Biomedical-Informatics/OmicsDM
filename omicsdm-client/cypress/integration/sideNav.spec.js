describe("sideNav", () => {
  beforeEach(() => {
    cy.login(Cypress.env("auth_user1"), "faq");
  });

  it("click on home icon", () => {
    cy.get("[alt='home icon']")
      .trigger("mouseover")
      .rerouteWithButton("#/");
  });

  it("click on dataset submission icon", () => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/all`, {
      fixture: "mocks/projects.json",
    }).as("show"); 

    cy.get("[alt='dataset submission icon']")
      .trigger("mouseover")
      .rerouteWithButton("#/createdatasets/selectproject");
  });

  it("click on file submission icon", () => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/all`, {
      fixture: "mocks/projects.json",
    }).as("show");

    cy.get("[alt='file submission icon']")
      .trigger("mouseover")
      .rerouteWithButton("#/uploadfiles/selectproject");
  });

  it("click on browse icon", () => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/all`, {
      fixture: "mocks/datasets.json",
    }).as("show");

    cy.intercept("GET", `${Cypress.env("apiUrl")}/datasets/viewcols`, {
      fixture: "mocks/datasetsViewCols.json",
    }).as("cols");

    cy.get("[alt='browse icon']")
      .trigger("mouseover")
      .rerouteWithButton("#/datasets");
  });

  it("administrate icon not visible",() => {
    cy.get("[alt='administrate icon']")
      .should("not.exist");
  });

  it("click on administrate icon", () => {

    window.localStorage.setItem('kcGroup', "admin");
    cy.login(Cypress.env("auth_admin"), "faq");

    cy.get("[data-testid='EngineeringIcon']")
      .trigger("mouseover")
      .rerouteWithButton("#/administrate");
  });

  it("test mouse over icons", () => {
    cy.get("[alt='home icon']").trigger("mouseover");
    cy.findByText("Create new dataset(s)");
    cy.findByText("Submit File(s)");
    cy.findByText("Browse Data");
  });

  it("test mouse out", () => {
    cy.get("[alt='home icon']")
      .trigger("mouseover")
      .trigger("mouseout");
  });
});
