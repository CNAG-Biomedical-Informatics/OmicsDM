describe("administrate", () => {
  beforeEach(() => {});

  // TODO
  // unshare with all groups --> should remove all shared groups
  // share with all groups -> should not add all groups
  // The sharedWith Collumn should not show the owner of the dataset

  it("access via url", () => {
    window.localStorage.setItem("kcGroup", "admin");

    cy.login(Cypress.env("auth_admin"), "administrate");

    cy.get(".home > .MuiTypography-root").should("exist");
    cy.get(".home > .MuiTypography-root").should("contain", "Hello admin");

    cy.get("[data-cy=show-admin-projects-view]")
      .should("exist")
      .should("contain", "Projects");

    cy.get("[data-cy=show-admin-datasets-view]")
      .should("exist")
      .should("contain", "Datasets");

    cy.get("[data-cy=show-admin-files-view]")
      .should("exist")
      .should("contain", "Files");
  });

  it("access via url no admin", () => {
    cy.login(Cypress.env("auth_user1"), "administrate");

    cy.get(".home > .MuiTypography-root").should("not.exist");
    cy.get(".MuiGrid-container > :nth-child(1)").should(
      "not.contain",
      "Projects"
    );
  });

  // TODO
  // Write for the tests below a helper function
  // to avoid code duplication

  it("show admin projects view", () => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/adminviewcols`, {
      fixture: "mocks/projectAdminViewCols.json",
    }).as("cols");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/admin/view`, {
      fixture: "mocks/projectsView.json",
    }).as("data");

    window.localStorage.setItem("kcGroup", "admin");

    cy.login(Cypress.env("auth_admin"), "administrate");

    cy.get("[data-cy=show-admin-projects-view]")
      .click()
      .location("hash")
      .should("to.eq", "#/admin/projects");

    cy.wait("@cols");
    cy.wait("@data");

    // TODO
    // check if the table shows all the expected data
    // *if not the mock fields are wrong

    // TODO
    // check if the dropdowns are working
    // and show the expected fields
  });

  it("show admin datasets view", () => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/adminviewcols`, {
      fixture: "mocks/datasetsViewCols.json",
    }).as("cols");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/admin/view`, {
      fixture: "mocks/datasets.json",
    }).as("data");

    window.localStorage.setItem("kcGroup", "admin");

    cy.login(Cypress.env("auth_admin"), "administrate");

    cy.get("[data-cy=show-admin-datasets-view]")
      .click()
      .location("hash")
      .should("to.eq", "#/admin/datasets");

    cy.wait("@cols");
    cy.wait("@data");

    // TODO
    // check if the table shows all the expected data
    // *if not the mock fields are wrong

    // TODO
    // check if the dropdowns are working
    // and show the expected fields
  });

  it("show admin files view", () => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/files/adminviewcols`, {
      fixture: "mocks/filesViewCols.json",
    }).as("cols");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/files/admin/view`, {
      fixture: "mocks/files.json",
    }).as("data");

    window.localStorage.setItem("kcGroup", "admin");

    cy.login(Cypress.env("auth_admin"), "administrate");

    cy.get("[data-cy=show-admin-files-view]")
      .click()
      .location("hash")
      .should("to.eq", "#/admin/files");

    cy.wait("@cols");
    cy.wait("@data");

    // TODO
    // check if the table shows all the expected data
    // *if not the mock fields are wrong

    // TODO
    // check if the dropdowns are working
    // and show the expected fields
  });
});
