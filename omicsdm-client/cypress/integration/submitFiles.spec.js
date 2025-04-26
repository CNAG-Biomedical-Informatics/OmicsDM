const url_suffix = "uploadfiles/selectproject";

describe("submit File", () => {
  beforeEach(() => {
    cy.intercept("GET", `${Cypress.env("apiUrl")}/files/submissioncols`, {
      fixture: "mocks/fileSubmissionCols.json",
    }).as("cols");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/list`, {
      fixture: "mocks/datasetIDs.json",
    });

    // intercept the request to get the possible projects
    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/all`, {
      fixture: "mocks/projects.json",
    }).as("show");
  });

  it("reroute with buttton", () => {
    cy.login(Cypress.env("auth_user1"), "submission");
    cy.findByText("Submit Files")
      .should("exist")
      .should("be.visible")
      .click()
      .location("hash")
      .should("be.eq", "#/uploadfiles/selectproject");
    cy.get("#project1").should("be.visible");
  });

  // TODO
  // change the test to check if submission of multiple rows is working

  it("add rows to the table", () => {
    cy.intercept("GET", `${Cypress.env("apiUrl")}/files/submissioncols`, {
      fixture: "mocks/fileSubmissionCols.json",
    }).as("cols");

    cy.login(Cypress.env("auth_user1"), url_suffix);
    cy.get("#project1")
      .should("be.visible")
      .click();

    cy.wait("@cols");

    cy.get("#addRow-1")
      .should("be.visible")
      .click();

    cy.get("#addRow-10")
      .should("be.visible")
      .click();

    cy.get("#addRow-100")
      .should("be.visible")
      .click();
  });

  it("fill table", () => {
    cy.login(Cypress.env("auth_user1"), url_suffix);
    cy.get("#project1").click();
    cy.tableInput(1, 3, "t1");
  });

  it("validate false", () => {
    cy.login(Cypress.env("auth_user1"), url_suffix);
    cy.get("#project1").click();
    cy.get(":nth-child(1) > .rt-tr > :nth-child(2) > div > input").attachFile(
      "testfile.tsv"
    );

    // same for submitDatasets so better put it in a function
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

  it("select Dataset", () => {
    cy.login(Cypress.env("auth_user1"), url_suffix);
    cy.get("#project1").click();
    cy.selectDataset("0000", 1);
  });

  it("upload file wrong ext", () => {
    cy.login(Cypress.env("auth_user1"), url_suffix);
    cy.get("#project1").click();
    cy.get(":nth-child(1) > .rt-tr > :nth-child(2) > div > input").attachFile(
      "testfile.json"
    );
    cy.findByText("VALIDATE")
      .click()
      .get(".MuiPaper-root")
      .contains("Error(s)")
      .then(() => {
        cy.get("[id^='error_form_']")
          .should("contain", "File suffix not recognised.")
          .should("exist");
      });
  });

  it("filename already assigned", () => {
    // not working
    // Unknown event handler property `onUploadedFilesChanged`. It will be ignored.

    cy.login(Cypress.env("auth_user1"), url_suffix);
    cy.get("#project1").click();
    cy.selectDataset("0000", 1);
    cy.get(":nth-child(1) > .rt-tr > :nth-child(2) > div > input").attachFile(
      "testfile.tsv"
    );

    cy.selectDataset("0000", 2);
    cy.get(":nth-child(2) > .rt-tr > :nth-child(2) > div > input").attachFile(
      "testfile.tsv"
    );

    cy.findByText("VALIDATE")
      .click()
      .get(".MuiPaper-root")
      .contains("Error(s)")
      .then(() => {
        cy.findByText("File name already assigned");
      });
  });

  it("validate true", () => {
    cy.login(Cypress.env("auth_user1"), url_suffix);
    cy.get("#project1").click();
    cy.selectDataset("0000", 1);
    cy.get(":nth-child(1) > .rt-tr > :nth-child(2) > div > input").attachFile(
      "testfile.tsv"
    );
    cy.findByText("VALIDATE")
      .click()
      .get(".MuiPaper-root")
      .should("contain", "No Errors");
  });

  it("submit true", () => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/files/startupload`, {
      fixture: "mocks/upload.json",
    });

    cy.intercept("GET", `${Cypress.env("apiUrl")}/files?to_sign=*`, {
      statusCode: 200,
      body: "n3Yj0QYEAT88PCUf5IKeq5+bFes=",
    });

    cy.intercept(`${Cypress.env("s3Url")}/**`, {
      fixture: "mocks/upload.xml",
    });

    cy.intercept("POST", `${Cypress.env("apiUrl")}/files/finishupload`, {
      statusCode: 200,
      body: { message: "File upload finished" },
    });

    cy.login(Cypress.env("auth_user1"), url_suffix);
    cy.get("#project1").click();
    cy.selectDataset("0000", 1);
    cy.submitFile("0000", "testfile.tsv");
  });
});
