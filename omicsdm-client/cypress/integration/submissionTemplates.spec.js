// !FIXME
// The submissionTemplates tests are still buggy

describe("submission templates", () => {
  beforeEach(() => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/all`, {
      fixture: "mocks/projects.json",
    }).as("show");
  });

  // TODO
  // FIX BELOW

  it("download dataset submission template", () => {
    cy.intercept(
      "POST",
      `${Cypress.env("apiUrl")}/datasets/submissioncols`,
      {
        fixture: "mocks/datasetSubmissionCols.json",
      }
    ).as("show");
    cy.login(Cypress.env("auth_user1"), "submitdatasets");
    cy.get("#project1").click();
    cy.downloadSubmissionTemplate("dataset");
  });

  it("download file submission template", () => {
    cy.intercept("GET", `${Cypress.env("apiUrl")}/files/submissioncols`, {
      fixture: "mocks/fileSubmissionCols.json",
    });

    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/list`, {
      fixture: "mocks/datasetIDs.json",
    });

    cy.login(Cypress.env("auth_user1"), "uploadfiles/selectproject");
    cy.get("#project1").click();
    cy.downloadSubmissionTemplate("file");
  });

  it("download project submission template", () => {
    cy.intercept("GET", `${Cypress.env("apiUrl")}/projects/submissioncols`, {
      fixture: "mocks/projectSubmissionCols.json",
    }).as("cols");

    window.localStorage.setItem("kcGroup", "admin");

    cy.login(Cypress.env("auth_user1"), "submitprojects");
    cy.downloadSubmissionTemplate("project");
  });

  // keeps on failing on Jenkins commented out for now
  // it("use dataset submission template", () => {
  //   cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/validate`, {
  //     fixture: "mocks/datasetValidate_true.json",
  //   }).as("validate");

  //   cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/create`, {
  //     fixture: "mocks/datasets.json",
  //   }).as("submit");

  //   cy.intercept(
  //     "POST",
  //     `${Cypress.env("apiUrl")}/datasets/submissioncols`,
  //     {
  //       fixture: "mocks/datasetSubmissionCols.json",
  //     }
  //   ).as("cols");

  //   cy.login(Cypress.env("auth_user1"), "submitdatasets");
  //   cy.get("#project1").click();

  //   cy.wait("@cols");

  //   cy.get(".csv-input").attachFile("dataset_template.tsv");

  //   cy.findAllByText("SUBMIT").click();
  //   cy.wait("@submit");

  //   cy.get(".MuiCircularProgress-svg").should("not.exist");
  //   cy.location("hash").should("to.eq", "#/datasetsubmitted");
  // });

  it("use wrong dataset submission template - field is missing", () => {
    cy.intercept(
      "POST",
      `${Cypress.env("apiUrl")}/datasets/submissioncols`,
      {
        fixture: "mocks/datasetSubmissionCols.json",
      }
    ).as("cols");

    cy.login(Cypress.env("auth_user1"), "submitdatasets");
    cy.get("#project1").click();

    cy.wait("@cols");
    cy.wait(1000)
    cy.get(".csv-input").attachFile("wrong_dataset_template.tsv");
    cy.findAllByText("This field is required.");
  });

  //! only works when doing end2end tests
  // it.only("use wrong dataset submission template - disease is not allowed", () => {
  //   cy.intercept(
  //     "POST",
  //     `${Cypress.env("apiUrl")}/datasets/submissioncols`,
  //     {
  //       fixture: "mocks/datasetSubmissionCols.json",
  //     }
  //   ).as("cols");

  //   cy.login(Cypress.env("auth_user1"), "submitdatasets");
  //   cy.get("#project1").click();

  //   cy.wait("@cols");
  //   cy.wait(1000)

  //   cy.get(".csv-input").attachFile(
  //     "wrong_dataset_template_disease_not_allowed.tsv"
  //   );

  //   cy.findAllByText("CANCER is not a valid option!");
  // });

  // it.only("use wrong dataset submission template - visibility option is not allowed", () => {
  //   // the used template has the visibility option set to "public"
  //   // but the project has the visibility restricted to "visible to all"
  //   // so it will just change it to the default "visible to all"

  //   // TODO
  //   // might be good to warn the user that the visibility option
  //   // has been changed to "visible to all" + explain why

  //   cy.intercept(
  //     "POST",
  //     `${Cypress.env("apiUrl")}/datasets/submissioncols?arg=disease`,
  //     {
  //       fixture: "mocks/datasetSubmissionCols_diseases.json",
  //     }
  //   ).as("disease");

  //   cy.intercept(
  //     "POST",
  //     `${Cypress.env("apiUrl")}/datasets/submissioncols?arg=visibility`,
  //     {
  //       fixture: "mocks/datasetSubmissionCols_visibility.json",
  //     }
  //   ).as("visibility");

  //   cy.login(Cypress.env("auth_user1"), "submitdatasets");
  //   cy.get("#project1").click();

  //   cy.wait("@disease");
  //   cy.wait("@visibility");
  //   cy.wait(1000)

  //   cy.get(".csv-input").attachFile(
  //     "wrong_dataset_template_visibility_option_not_allowed.tsv"
  //   );

  //   cy.findAllByText("visible to all");
  // });

  it("use file submission template", () => {
    cy.intercept("GET", `${Cypress.env("apiUrl")}/files/submissioncols`, {
      fixture: "mocks/fileSubmissionCols.json",
    }).as("cols");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/list`, {
      fixture: "mocks/datasetIDs.json",
    }).as("show");

    cy.login(Cypress.env("auth_user1"), "uploadfiles/selectproject");
    cy.get("#project1").click();

    cy.get(".csv-input").attachFile("file_template.tsv");
    cy.wait("@show");

    cy.get(":nth-child(1) > .rt-tr > :nth-child(2) > div > input").attachFile(
      "testfile.tsv"
    );
    cy.get(":nth-child(2) > .rt-tr > :nth-child(2) > div > input").attachFile(
      "testfile2.tsv"
    );

    cy.findByText("VALIDATE")
      .click()
      .get(".MuiPaper-root")
      .should("contain", "No Errors");
  });

  it("use wrong file submission template", () => {
    cy.intercept("GET", `${Cypress.env("apiUrl")}/files/submissioncols`, {
      fixture: "mocks/fileSubmissionCols.json",
    }).as("cols");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/list`, {
      fixture: "mocks/datasetIDs.json",
    });

    cy.login(Cypress.env("auth_user1"), "uploadfiles/selectproject");
    cy.get("#project1").click();
    cy.get(".csv-input").attachFile("wrong_file_template.tsv");

    cy.get(":nth-child(1) > .rt-tr > :nth-child(2) > div > input").attachFile(
      "testfile.tsv"
    );
    cy.get(":nth-child(2) > .rt-tr > :nth-child(2) > div > input").attachFile(
      "testfile2.tsv"
    );

    cy.findAllByText("This field is required.");
  });

  it("use project submission template", () => {

    // BUGGY

    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/validate`, {});

    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/create`, {
      fixture: "mocks/datasets.json",
    }).as("submit");

    cy.intercept("GET", `${Cypress.env("apiUrl")}/projects/submissioncols`, {
      fixture: "mocks/projectSubmissionCols.json",
    }).as("cols");

    window.localStorage.setItem("kcGroup", "admin");

    cy.login(Cypress.env("auth_admin"), "submitprojects");
    cy.wait("@cols");
    cy.get(".csv-input").attachFile("project_template.tsv");

    cy.findByText("SUBMIT").click();
    cy.location("hash").should("to.eq", "#/projectsubmitted");
  });

  it("use wrong project submission template", () => {
    window.localStorage.setItem("kcGroup", "admin");

    // BUGGY

    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/validate`, {});

    cy.intercept("GET", `${Cypress.env("apiUrl")}/projects/submissioncols`, {
      fixture: "mocks/projectSubmissionCols.json",
    }).as("cols");

    cy.login(Cypress.env("auth_admin"), "submitprojects");
    cy.wait("@cols");
    cy.get(".csv-input").attachFile("wrong_project_template.tsv");

    cy.findAllByText("This field is required.");
  });
});
