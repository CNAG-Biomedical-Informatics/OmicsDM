describe("manage datasets", () => {
  beforeEach(() => {
    cy.intercept("GET", `${Cypress.env("apiUrl")}/datasets/viewcols`, {
      fixture: "mocks/datasetsViewCols.json",
    }).as("cols");

    cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/all`, {
      fixture: "mocks/datasets.json",
    }).as("show");
  });

  it("download table to csv", () => {
    cy.login(Cypress.env("auth_user1"), "datasets");
    // FIXME
    // cy.get("[data-cy=download-table-to-csv]").should("exist").should("be.visible")
    //This element <i.fa.fa-download> is not visible because
    // it has an effective width and height of: 0 x 0 pixels.

    // current work around ({force: true})
    cy.get("[data-cy=download-table-to-csv]")
      .should("exist")
      .click({ force: true });
  });

  it("(un)select all checkboxes", () => {
    cy.loadData("datasets", Cypress.env("auth_user1"));
    cy.get("[data-cy=select-all-checkbox]", { timeout: 4000 })
      .should("be.visible")
      .click({
        force: true,
      });
    cy.get("[data-cy=select-all-checkbox]").should("be.checked");
    cy.get("[data-cy=select-all-checkbox]").click({ force: true });
    cy.get("[data-cy=select-all-checkbox]").should("not.be.checked");
  });

  it("(un)select one checkbox", () => {
    cy.loadData("datasets", Cypress.env("auth_user1"));

    cy.get("[data-cy=select-row-checkbox-0]").should("be.visible");
    cy.getSettled("[data-cy=select-row-checkbox-0]").click()
    cy.get("[data-cy=select-row-checkbox-0]").should("be.checked");

    cy.get("[data-cy=select-row-checkbox-0]").should("be.visible");
    cy.getSettled("[data-cy=select-row-checkbox-0]").click()
    cy.get("[data-cy=select-row-checkbox-0]").should("not.be.checked");
  });

  it("owner icon visible", () => {
    cy.loadData("datasets", Cypress.env("auth_user1"));
    cy.get(
      ':nth-child(n) > .rt-tr > [style="flex: 60 0 auto; width: 60px; max-width: 60px;"] > .MuiSvgIcon-root'
    ).should("exist");
  });

  // TODO
  // make sure that the owner icon is not visible
  // for the dataset uploaded by group cnag

  // below are failing because the project arg is missing

  it("apply action share with all groups", () => {
    // sets the datasets visibility to "visible to all"
    cy.intercept(
      "PUT",
      `${Cypress.env(
        "apiUrl"
      )}/datasets?arg=addGroup&project=test&dataset=test&group=ALL`,
      {
        statusCode: 200,
      }
    );
    cy.loadData("datasets", Cypress.env("auth_user1"));

    cy.getSettled("[data-cy=select-all-checkbox]").click()
    // cy.checkBox("span > .checkbox", 2);
    cy.applyAction("Share with groups", "ALL");
  });

  it("apply action unshare with all groups", () => {
    // sets the datasets visibility to private
    cy.intercept(
      "PUT",
      `${Cypress.env(
        "apiUrl"
      )}/datasets?arg=removeGroup&project=test&dataset=test&group=ALL`,
      {
        statusCode: 200,
      }
    );
    // question
    // "unshare with all groups"
    // -> should it ONLY set the dataset to private? [like it is doing now]
    // or should it also remove all the shared groups?
    cy.loadData("datasets", Cypress.env("auth_user1"));

    cy.getSettled("[data-cy=select-all-checkbox]").click()
    cy.get("[data-cy=select-all-checkbox]").should("be.checked");
    // cy.checkBox("span > .checkbox", 2);
    cy.applyAction("Unshare with groups", "ALL");
  });

  it("apply action share with one group", () => {
    // adds a group to "Shared with"
    cy.intercept(
      "PUT",
      `${Cypress.env(
        "apiUrl"
      )}/datasets?arg=addGroup&project=test&dataset=test&group=cnag`,
      {
        statusCode: 200,
      }
    );
    cy.loadData("datasets", Cypress.env("auth_user1"));
    // cy.checkBox("span > .checkbox", 2);

    cy.getSettled("[data-cy=select-all-checkbox]").click()
    cy.get("[data-cy=select-all-checkbox]").should("be.checked");
    cy.applyAction("Share with groups", "cnag");
  });

  it("apply action unshare with one group", () => {
    // removes one group from "Shared with"
    cy.intercept(
      "PUT",
      `${Cypress.env(
        "apiUrl"
      )}/datasets?arg=removeGroup&project=test&dataset=test&group=cnag`,
      {
        statusCode: 200,
      }
    );
    cy.loadData("datasets", Cypress.env("auth_user1"));
    // cy.checkBox("span > .checkbox", 2);
    cy.getSettled("[data-cy=select-all-checkbox]").click()
    cy.get("[data-cy=select-all-checkbox]").should("be.checked");
    cy.applyAction("Unshare with groups", "cnag");
  });
});
