// TODO
// add tests for filtering of datasets

describe("filter datasets", () => {
  beforeEach(() => {
    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/all`, {
      fixture: "mocks/datasets.json",
    }).as("show");

    cy.intercept("GET", `${Cypress.env("apiUrl")}/datasets/viewcols`, {
      fixture: "mocks/datasetsViewCols.json",
    }).as("cols");
  });

  it("filter datasets", () => {
    cy.loadData("datasets", Cypress.env("auth_user1"));

    cy.get("[data-cy=visibility-dropdown]");
    cy.get("[data-cy=healthyControllsIncluded-dropdown]");
    cy.get(":nth-child(n) > input");
  });

  // see 3TR-e2e for filtering of datasets

  // it("owner icon visible", () => {
  //   cy.login(Cypress.env("auth_user1"), "submitdatasets");

  //   const datasetId = Date.now();
  //   cy.submitDatasets([[datasetId, "COPD", "other", "private"]]);
  //   cy.logout();

  //   cy.loadData("datasets", Cypress.env("auth_user1"));
  //   cy.get(
  //     ':nth-child(n) > .rt-tr > [style="flex: 120 0 auto; width: 120px; max-width: 120px;"] > .MuiSvgIcon-root'
  //   ).should("exist");
  // });

  // it("filter datasets by owner=user is owner", () => {
  //   //Stops working if the number of rows > 100
  //   // => empty the database and run the test again

  //   cy.login(Cypress.env("auth_user1"), "submitdatasets");
  //   cy.submitDatasets([[Date.now(), "COPD", "other", "private"]]);
  //   cy.logout();

  //   cy.login(Cypress.env("auth_user2"), "submitdatasets");
  //   cy.submitDatasets([[Date.now(), "COPD", "other", "visible to all"]]);
  //   cy.logout();

  //   cy.loadData("datasets", Cypress.env("auth_user1"));

  //   const conditionValues = ["3tr", "ownerIcon"];
  //   const expectedCount = null;
  //   cy.filterRows(
  //     ['[style="flex: 120 0 auto; width: 120px; max-width: 120px;"]'],
  //     conditionValues,
  //     expectedCount
  //   );
  // });

  // it("filter datasets by owner=user is not owner", () => {
  //   cy.login(Cypress.env("auth_user1"), "submitdatasets");

  //   cy.submitDatasets([[Date.now(), "COPD", "other", "private"]]);
  //   cy.logout();

  //   cy.login(Cypress.env("auth_user2"), "submitdatasets");
  //   cy.submitDatasets([[Date.now(), "COPD", "other", "visible to all"]]);
  //   cy.logout();

  //   cy.loadData("datasets", Cypress.env("auth_user1"));

  //   const conditionValues = ["cnag"];
  //   const expectedCount = null;
  //   cy.filterRows(
  //     ['[style="flex: 120 0 auto; width: 120px; max-width: 120px;"]'],
  //     conditionValues,
  //     expectedCount
  //   );
  // });

  // it("filter datasets by id", () => {
  //   cy.login(Cypress.env("auth_user1"), "submitdatasets");

  //   const datasetId = Date.now();
  //   const datasetId2 = datasetId - 1;
  //   cy.submitDatasets([
  //     [datasetId, "COPD", "other", "private"],
  //     [datasetId2, "COPD", "other", "private"],
  //   ]);

  //   cy.logout();
  //   cy.loadData("datasets", Cypress.env("auth_user1"));

  //   const conditionValues = [datasetId];
  //   const expectedCount = 1;
  //   cy.filterRows([":nth-child(3)"], conditionValues, expectedCount);
  // });

  // it("filter datasets by disease=ASTHMA", () => {
  //   cy.login(Cypress.env("auth_user1"), "submitdatasets");

  //   const datasetId = Date.now();
  //   const datasetId2 = datasetId - 1;
  //   cy.submitDatasets([
  //     [datasetId, "COPD", "other", "private"],
  //     [datasetId2, "ASTHMA", "other", "private"],
  //   ]);
  //   cy.logout();
  //   cy.loadData("datasets", Cypress.env("auth_user1"));

  //   const conditionValue = ["ASTHMA"];
  //   const expectedCount = null;
  //   cy.filterRows([":nth-child(8)"], conditionValue, expectedCount);
  // });

  // it("filter datasets by visibility=private", () => {
  //   cy.login(Cypress.env("auth_user1"), "submitdatasets");

  //   const datasetId = Date.now();
  //   const datasetId2 = datasetId - 1;
  //   cy.submitDatasets([
  //     [datasetId, "COPD", "other", "private"],
  //     [datasetId2, "ASTHMA", "other", "visible to all"],
  //   ]);
  //   cy.logout();
  //   cy.loadData("datasets", Cypress.env("auth_user1"));

  //   const conditionValue = ["private"];
  //   const expectedCount = null;
  //   cy.filterRows([":nth-child(11)"], conditionValue, expectedCount);
  // });
});