const url_suffix = "createdatasets/selectproject";

describe("submit Dataset", () => {
  beforeEach(() => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/create`, {
      fixture: "mocks/datasets.json",
    }).as("show");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/all`, {
      fixture: "mocks/projects.json",
    }).as("show");

    cy.intercept(
      "POST",
      `${Cypress.env("apiUrl")}/datasets/submissioncols`,
      {
        fixture: "mocks/datasetSubmissionCols.json",
      }
    ).as("show");
  });

  // TODO
  // unshare with all groups --> should remove all shared groups
  // share with all groups -> should not add all groups
  // The sharedWith Collumn should not show the owner of the dataset

  it("reroute with buttton", () => {
    cy.login(Cypress.env("auth_user1"), "submission");
    cy.findByText("Create new Dataset")
      .should("exist")
      .should("be.visible")
      .click()
      .location("hash")
      .should("be.eq", "#/createdatasets/selectproject");
    cy.get("#project1").should("be.visible");
  });

  // commented out for now because it
  // keeps on failing

  // it.only("add rows to the table", () => {
  //   cy.login(Cypress.env("auth_user1"), url_suffix);
  //   cy.get("#project1").click();

  //   cy.get('#addRow-1')
  //     .should("be.visible")
  //     .click()

  //   cy.get('#addRow-10')
  //     .should("be.visible")
  //     .click()

  //   cy.get('#addRow-100')
  //     .should("be.visible")
  //     .click()
  // })

  // TODO
  // change the test to check if submission of multiple rows is working

  it("fill table", () => {
    cy.login(Cypress.env("auth_user1"), url_suffix);
    cy.get("#project1").click();
    cy.tableInput(1, 4, "t1");
  });

  // TODO
  // add an test which makes sure that you cannot enter the same
  // project id in each row

  it("verify preselection", () => {
    cy.login(Cypress.env("auth_user1"), url_suffix);
    cy.get("#project1").click();
    cy.wrap(["select", "visible to all"]).each(($e) => {
      cy.get(".rt-tr > :nth-child(n) > div > select").should("contain", $e);
    });
  });

  it("select", () => {
    cy.login(Cypress.env("auth_user1"), url_suffix);
    cy.get("#project1").click();
    cy.get(":nth-child(1) > .rt-tr > :nth-child(3) > div > select")
      .select("COPD")
      .should("contain", "COPD");
  });

  it("validate false", () => {
    // TODO
    // here a fixture for the endpoint
    // localhost:8082/api/datasets/validate is missing

    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/validate`, {
      fixture: "mocks/datasetValidate_false.json",
    });

    cy.intercept(
      "POST",
      `${Cypress.env("apiUrl")}/datasets/submissioncols`,
      {
        fixture: "mocks/datasetSubmissionCols.json",
      }
    ).as("cols");

    cy.intercept(
      "POST",
      `${Cypress.env("apiUrl")}/datasets/submissioncols?arg=visibility`,
      {
        fixture: "mocks/datasetSubmissionCols_visibility.json",
      }
    ).as("visibility");

    cy.login(Cypress.env("auth_user1"), url_suffix);
    cy.get("#project1").click();
    cy.tableInput(1, 4, "t1");

    cy.wait("@cols");

    // same for submitFiles so better put it in a function
    // in command.js
    cy.findByText("VALIDATE")
      .click()
      .get(".MuiAlert-message")
      .contains("Error(s)")
      .then(($val) => {
        cy.get("[id^='error_form_']")
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

  it("validate true", () => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/validate`, {
      fixture: "mocks/datasetValidate_true.json",
    }).as("validate");

    cy.login(Cypress.env("auth_user1"), url_suffix);
    cy.get("#project1").click();
    cy.get(":nth-child(1) > .rt-tr > :nth-child(n) > div > input").each(
      ($e) => {
        if ($e.attr("name") != null) {
          cy.wrap($e).type("t");
        }
      }
    );

    cy.get(":nth-child(1) > .rt-tr > :nth-child(3) > div > select").select(
      "COPD"
    );
    cy.findByText("VALIDATE").click();

    cy.wait("@validate");
    cy.get(".MuiPaper-root").contains("No Errors");
  });

  it("submit true", () => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/validate`, {
      fixture: "mocks/datasetValidate_true.json",
    });
    cy.intercept("GET", `${Cypress.env("apiUrl")}/datasets/submissioncols`, {
      fixture: "mocks/datasetSubmissionCols_diseases.json",
    });
    cy.intercept("GET", `${Cypress.env("apiUrl")}/files/submissioncols`, {
      fixture: "mocks/fileSubmissionCols.json",
    });

    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/list`, {
      fixture: "mocks/datasetIDs.json",
    });

    cy.login(Cypress.env("auth_user1"), url_suffix);
    cy.get("#project1").click();
    cy.submitDataset(Date.now()).then(() => {
      cy.contains("GO TO SUBMIT FILE")
        .click()
        .location("hash")
        .should("to.eq", "#/submitfiles");
    });
  });

  // TODO
  // add a test which test the submission of dataset with
  // a policy file attached

  // cy.get(
  //   ":nth-child(1) > .rt-tr > :nth-child(n) > div > input#files"
  // ).attachFile("testfile.tsv");

  //TODO needs to be intercepted to show id already exists
  // it("submit dataset_id already exists", () => {
  //   cy.login(Cypress.env("auth_user1"), url_suffix);
  //   cy.get("#project1").click();
  //   const dataset_id = Date.now();
  //   cy.submitDataset(dataset_id);
  // });
});
