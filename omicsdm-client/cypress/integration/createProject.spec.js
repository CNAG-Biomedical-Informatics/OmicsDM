const url_suffix = "submitprojects";

describe("submit Project", () => {
  beforeEach(() => {
    cy.intercept("GET", `${Cypress.env("apiUrl")}/projects/submissioncols`, {
      fixture: "mocks/projectSubmissionCols.json",
    });
  });

  // TODO
  // unshare with all groups --> should remove all shared groups
  // share with all groups -> should not add all groups
  // The sharedWith Collumn should not show the owner of the dataset

  it("reroute with button", () => {
    window.localStorage.setItem("kcGroup", "admin");

    cy.login(Cypress.env("auth_admin"), "submission");
    cy.findByText("Create new Project")
      .should("exist")
      .should("be.visible")
      .click()
      .location("hash")
      .should("be.eq", "#/submitprojects");
  });

  it("create new project should not be visible for non admin users", () => {
    cy.login(Cypress.env("auth_user1"), "submission");

    cy.findByText("Create new Dataset").should("exist");
    cy.findByText("Submit Files").should("exist");
    cy.findByText("Create new Project").should("not.exist");
  });

  // TODO
  // change the test to check if submission of multiple rows is working

  it("fill table", () => {
    window.localStorage.setItem("kcGroup", "admin");
    cy.login(Cypress.env("auth_admin"), url_suffix);
    cy.tableInput(1, 1, "test");
  });

  // TODO
  // add an test which makes sure that you cannot enter the same
  // project id in each row

  // FIXME
  // pre selection of the first row is different to the following rows
  // 1.row: Dataset Visibility default = private
  // 2.row: Dataset Visibility default = public

  it("verify preselection", () => {
    window.localStorage.setItem("kcGroup", "admin");

    cy.login(Cypress.env("auth_admin"), url_suffix);
    cy.wrap(["visible to all", "true"]).each(($e) => {
      cy.get(".rt-tr > :nth-child(n) > div > select").should("contain", $e);
    });
  });

  // FIXME
  // .should("contain"..)
  // is not working as I expect it to work
  // it does not verify that the selection has changed
  // because .select("public").should("contain", "private")
  // I expect to fail but it does not fail

  it("select", () => {
    window.localStorage.setItem("kcGroup", "admin");

    cy.login(Cypress.env("auth_admin"), url_suffix);
    cy.get(":nth-child(1) > .rt-tr > :nth-child(7) > div > select")
      .select("visible to all")
      .should("contain", "visible to all");
  });

  it("validate false", () => {
    window.localStorage.setItem("kcGroup", "admin");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/validate`, {});

    cy.login(Cypress.env("auth_admin"), url_suffix);
    cy.tableInput(1, 4, "t1");

    cy.findByText("VALIDATE")
      .click()
      .get(".MuiAlert-message")
      .contains("Error(s)")
      .then(($val) => {
        cy.findAllByText("This field is required.")
          .its("length")
          .then(($errors) => {
            cy.wrap($val)
              .invoke("text")
              .then(parseInt)
              .should("be.a", "number")
              .and("be.eq", $errors);
          });
      });
  });

  //TODO
  //validate should test if the input "Owners" are valid keycloak groups

  it("validate true", () => {
    window.localStorage.setItem("kcGroup", "admin");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/validate`, {});

    cy.login(Cypress.env("auth_admin"), url_suffix);
    cy.get(":nth-child(1) > .rt-tr > :nth-child(1) > div > input").type("t1");
    cy.get(":nth-child(1) > .rt-tr > :nth-child(3) > div > input").type("3tr");
    cy.get(":nth-child(1) > .rt-tr > :nth-child(5) > div > input").type(
      "ASTHMA"
    );

    cy.findByText("VALIDATE")
      .click()
      .get(".MuiPaper-root")
      .contains("No Errors");
  });

  // FIXME
  // it should also work when the server is not reachable

  it("submit true", () => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/validate`, {});

    window.localStorage.setItem("kcGroup", "admin");

    cy.login(Cypress.env("auth_admin"), url_suffix);
    const project_id = Date.now();
    cy.createProject(project_id).then(() => {
      cy.contains("GO TO MAIN PAGE")
        .click()
        .location("hash")
        .should("to.eq", "#/");
    });
  });

  //TODO needs to be intercepted to show id already exists
  it("submit project_id already exists", () => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/validate`, {});

    window.localStorage.setItem("kcGroup", "admin");

    cy.login(Cypress.env("auth_admin"), url_suffix);
    const project_id = Date.now();
    cy.createProject(project_id);
  });
});
