//requires custom comands checkBox & uncheckBox in support/commands.js

describe("download files", () => {
  beforeEach(() => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/files/all`, {
      fixture: "mocks/files.json",
    }).as("files");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/all`, {
      fixture: "mocks/projects.json",
    }).as("show");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/all`, {
      fixture: "mocks/datasets.json",
    }).as("show");

    cy.intercept("GET", `${Cypress.env("apiUrl")}/datasets/viewcols`, {
      fixture: "mocks/datasetsViewCols.json",
    }).as("cols");

    cy.intercept("GET", `${Cypress.env("apiUrl")}/files/viewcols`, {
      fixture: "mocks/filesViewCols.json",
    }).as("filescols");
  });

  it("submit file group 3tr", () => {

    cy.intercept("GET", `${Cypress.env("apiUrl")}/files/submissioncols`, {
      fixture: "mocks/fileSubmissionCols.json",
    }).as("cols");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/list`, {
      fixture: "mocks/datasetIDs.json",
    });

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

    cy.intercept("http://172.16.10.100:9095/bucketdevel3tropal/**", {
      fixture: "mocks/upload.xml",
    });

    cy.intercept("POST", `${Cypress.env("apiUrl")}/files/finishupload`, {
      statusCode: 200,
      body: { message: "File upload finished" },
    });

    cy.login(Cypress.env("auth_user1"), "uploadfiles/selectproject");
    cy.get("#project1").click();
    cy.selectDataset("0000", 1);
    cy.submitFile("0000", "testfile.tsv");
  });

  it("download table to csv", () => {
    cy.login(Cypress.env("auth_user1"), "datasets");
    
    cy.get("[data-cy=show-all-files]").click();
    
    // FIXME
    // cy.get("[data-cy=download-table-to-csv]").should("exist").should("be.visible")
    //This element <i.fa.fa-download> is not visible because
    // it has an effective width and height of: 0 x 0 pixels.
    
    // current work around ({force: true})
    cy.get("[data-cy=download-table-to-csv]")
      .should("exist")
      .click({ force: true });

    // TODO
    // validate that csv file has the expected file name
    // cypress/downloads/2022-05-20_file_list.csv
  });

  it("owner icon visible", () => {
    cy.loadData("files", Cypress.env("auth_user1"));
    cy.get(
      ':nth-child(n) > .rt-tr > [style="flex: 60 0 auto; width: 60px; max-width: 60px;"] > .MuiSvgIcon-root'
    ).should("exist");
  });

  it("(un)select all checkboxes", () => {

    // !FIXME
    // flaky test

    cy.loadData("files", Cypress.env("auth_user1"));
    
    cy.wait("@filescols");
    
    //TODO count number of shown rows
    cy.checkBox("span > .checkbox", 2);
    cy.uncheckBox("span > .checkbox");
  });

  it("(un)select one checkbox", () => {

    // !FIXME
    // flaky test

    cy.loadData("files", Cypress.env("auth_user1"));

    cy.wait("@filescols");

    cy.checkBox(":nth-child(1) > .rt-tr > > .checkbox", 1);
    cy.uncheckBox(":nth-child(1) > .rt-tr > > .checkbox");
  });

  it("download file to memory", () => {
    // only works with electron browser
    cy.intercept("POST", `${Cypress.env("apiUrl")}/files/download`, {
      statusCode: 200,
      body: {
        message: "returned presigned urls",
        presignedUrls: { "1": "http://0.0.0.0:9095/bucket/3tr/" },
      },
    });

    cy.loadData("files", Cypress.env("auth_user1"));
    cy.checkBox(":nth-child(1) > .rt-tr > > .checkbox", 1);

    cy.get("[data-cy=download-files]").click();

    cy.get(
      ".MuiDialogContent-root > .ReactTable > .rt-table > .rt-tbody > .rt-tr-group > .rt-tr > :nth-child(n)"
    ).then((values) => {
      const url = values[4].innerText;
      // make sure the that the owner value (e.g. "3TR")
      expect(url).to.contain("/3tr/");

      //commented out for now because it keeps failing in Jenkins
      // --> should work with Electron Browser
      cy.get(":nth-child(6) > .MuiButtonBase-root > .MuiButton-label").click();
      cy.window()
        .its("navigator.clipboard")
        .invoke("readText")
        .should("equal", url);
    });
  });
});
