// Cypress plugins
import "@testing-library/cypress/add-commands";
import "cypress-keycloak-commands";
import "cypress-file-upload";
import "@cypress/code-coverage/support";
import 'cypress-wait-until';

// recursively gets an element, returning only after it's determined to be attached to the DOM for good
// found the snippet below here:
// https://github.com/cypress-io/cypress/issues/7306#issuecomment-850621378
Cypress.Commands.add('getSettled', (selector, opts = {}) => {
    const retries = opts.retries || 3;
    const delay = opts.delay || 100;

    const isAttached = (resolve, count = 0) => {
        const el = Cypress.$(selector);

        // is element attached to the DOM?
        count = Cypress.dom.isAttached(el) ? count + 1 : 0;

        // hit our base case, return the element
        if (count >= retries) {
            return resolve(el);
        }

        // retry after a bit of a delay
        setTimeout(() => isAttached(resolve, count), delay);
    };

    // wrap, so we can chain cypress commands off the result
    return cy.wrap(null).then(() => {
        return new Cypress.Promise((resolve) => {
            return isAttached(resolve, 0);
        }).then((el) => {
            return cy.wrap(el);
        });
    });
});

// Project specific custom commands:
Cypress.Commands.add("login", (user, redirect) => {
  const homeUrl = Cypress.env("homeUrl");
  cy.log("user >>", user);
  cy.log("redirect >>", redirect);

  if (homeUrl.includes(":5000")) {
    cy.kcFakeLogin(user, `#/login/?redirect=/${redirect}`);
    return;
  }
  cy.visit(homeUrl);
  cy.get("#username")
    .type(user)
    .get("#password")
    .type(Cypress.env("auth_password"));
  cy.get("#kc-login").click();
  cy.wait(300);
  cy.visit(`${Cypress.config("baseUrl")}/#/${redirect}`);
});

Cypress.Commands.add("checkForSessionExpired", () => {
  cy.get(".alert").should("contain", "Session expired. Please login again");
  cy.get(".close").click();
  cy.url().should("contain", "sso");
});

Cypress.Commands.add(
  "rerouteWithButton",
  { prevSubject: true },
  (selector, expectedReroute) => {
    cy.wrap(selector)
      .should("exist")
      .should("be.visible")
      .click()
      .location("hash")
      .should("be.eq", expectedReroute);
  }
);
Cypress.Commands.add("createProject", (project_id) => {
  // TODO
  // merge this with submitDataset

  // TODO
  // this does need to return a fixture
  // just stubbed so it does not try to reach the server
  cy.intercept("POST", `${Cypress.env("apiUrl")}/projects/create`, {
    fixture: "mocks/datasets.json",
  }).as("submit");

  cy.get(":nth-child(1) > .rt-tr > :nth-child(1) > div > input").type(
    project_id
  );
  cy.get(":nth-child(1) > .rt-tr > :nth-child(3) > div > input").type("3tr");

  cy.get(":nth-child(1) > .rt-tr > :nth-child(5) > div > input").type("ASTHMA");

  cy.findAllByText("SUBMIT").click();
  cy.wait("@submit");

  // make sure that there is no longer the loading spinner
  cy.get(".MuiCircularProgress-svg").should("not.exist");

  cy.get("body").then((body) => {
    if (body.find(".alert").length > 0) {
      cy.get(".alert").should("contain", "project_id already exists");
    } else {
      cy.location("hash").should("to.eq", "#/projectsubmitted");
      cy.wrap([project_id, "3tr", "private", "true", "true"]).each(($e) => {
        cy.get("tbody > tr > :nth-child(n)").should("contain", $e);
      });
    }
  });
});

Cypress.Commands.add("submitDataset", (dataset_id) => {

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

  cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/create`, {
    fixture: "mocks/datasets.json",
  }).as("submit");

  cy.get(":nth-child(1) > .rt-tr > :nth-child(n) > div > input").each(($e) => {
    if ($e.attr("name") != null) {
      cy.wrap($e).type("t");
    }
  });

  cy.get(":nth-child(1) > .rt-tr > :nth-child(1) > div > input").type(
    `{backspace}${dataset_id}`
  );
  cy.get(":nth-child(1) > .rt-tr > :nth-child(3) > div > select").select(
    "COPD"
  );

  // cy.get(
  //   ":nth-child(1) > .rt-tr > :nth-child(n) > div > input#files"
  // ).attachFile("testfile.tsv");

  cy.findAllByText("SUBMIT").click();
  cy.wait("@submit");

  // make sure that there is no longer the loading spinner
  cy.get(".MuiCircularProgress-svg").should("not.exist");

  cy.get("body").then((body) => {
    if (body.find(".alert").length > 0) {
      cy.get(".alert").should("contain", "dataset_id already exists");
    } else {
      cy.location("hash").should("to.eq", "#/datasetsubmitted");
      cy.wrap([dataset_id, "COPD", "t"]).each(($e) => {
        cy.get("tbody > tr > :nth-child(n)").should("contain", $e);
      });
    }
  });
});

Cypress.Commands.add("tableInput", (row, col, value) => {
  cy.get(`:nth-child(${row}) > .rt-tr > :nth-child(${col}) > div > input`)
    .clear()
    .type(value)
    .should("have.value", value);
});

Cypress.Commands.add("selectDataset", (id, row) => {
  cy.get(`:nth-child(${row}) > .rt-tr > :nth-child(1) > div > div > div `)
    .click()
    .then(() => {
      cy.get("[id*=option-0]")
        .click()
        .then(() => {
          cy.get(
            `:nth-child(${row}) > .rt-tr > :nth-child(1) > div > div > div`
          ).should("contain", id);
        });
    });
});

Cypress.Commands.add("selectPlatform", (option, row) => {
  cy.get(`:nth-child(${row}) > .rt-tr > :nth-child(n) > div > select`)
    .select(option)
    .should("contain", option);
});

Cypress.Commands.add("submitFile", function(dataset_id, file_name) {
  cy.intercept("POST", `${Cypress.env("apiUrl")}/files/finishupload`).as(
    "upload"
  );

  cy.get(":nth-child(1) > .rt-tr > :nth-child(2) > div > input").attachFile(
    file_name
  );

  cy.findByText("SUBMIT").click();

  cy.wait("@upload", { timeout: 100000 });

  cy.location("hash").should("to.eq", "#/filesubmitted");
  cy.wrap([dataset_id, file_name]).each(($e) => {
    cy.get("tbody > tr > :nth-child(n)").should("contain", $e);
  });
});

Cypress.Commands.add("loadData", (endpoint, user) => {
  let fixtureFile = "mocks/datasets_shared_w_all.json";
  if (endpoint === "files") {
    fixtureFile = "mocks/files.json";
  }
  cy.intercept(`${Cypress.env("apiUrl")}/${endpoint}/all`, {
    fixture: fixtureFile,
  }).as("show");

  if (endpoint === "files") {
    cy.login(user, "datasets");
    cy.get("[data-cy=show-all-files]").click();
  } else {
    cy.login(user, endpoint);
  }

  cy.wait("@show").should((intercept) => {
    expect(intercept.response.statusCode).to.eq(200);
    expect(intercept.response).to.have.property("body");
  });

  cy.get(".-loading-active").should("not.exist");
});

Cypress.Commands.add("checkBox", (selector) => {
  // TODO: const selection = "Selected: " + count
  cy.get(selector)
    // .should("be.visible")
    .check();
  cy.get(selector).should("be.checked");
  // TODO: cy.get('[style="margin-left: 10px;"]').should("contain",selection);
});

Cypress.Commands.add("uncheckBox", (selector) => {
  cy.get(selector).uncheck();
  cy.get(selector).should("not.be.checked");
  // TODO: cy.get('[style="margin-left: 10px;"]').should("contain", "Selected: 0");
});

Cypress.Commands.add("applyAction", (action, group) => {
  // TODO
  // overwrite with applyAction of 3TR-e2e

  cy.intercept("https://sso.cnag.crg.dev/auth/admin/realms/3TR/groups", {
    fixture: "mocks/groups.json",
  }).as("getGroups");

  const colSelector = ".rt-tbody > :nth-child(n) > .rt-tr > :nth-child";

  let status = "private";
  if (action === "Share with groups" && group === "ALL") {
    status = "visible to all";
  }

  const parseTextContent = (recordsInfo, field) =>
    parseInt(recordsInfo.split(" ")[field]);

  for (const element of [
    [".records-info", 2, "recordsCount"],
    [".select-wrap > select", 0, "rowsPerPageCount"],
  ]) {
    let [selector, field, alias] = element;

    cy.get(selector)
      .invoke("text")
      .then((textContent) => {
        cy.wrap({ value: parseTextContent })
          .invoke("value", textContent, field)
          .as(alias);
      });
  }

  //overwrite the default intercept
  let mock = "mocks/datasets_unshared_w_all.json";
  if (group === "ALL") {
    if (action === "Share with groups") {
      mock = "mocks/datasets_shared_w_all.json";
    }
  } else if (action === "Share with groups") {
    mock = "mocks/datasets_shared_w_cnag.json";
  }
  cy.intercept("POST", `${Cypress.env("apiUrl")}/datasets/all`, {
    fixture: mock,
  }).as("show");

  cy.get("[data-cy=action-select]").select(action);
  cy.get("[data-cy=btn-select-groups]").click();

  cy.get("@recordsCount").then((recordsCount) => {
    cy.get(
      ".MuiDialogContent-root > .ReactTable > .rt-table > .rt-tbody > :nth-child(n) > .rt-tr > :nth-child(1)"
    ).should("have.length", recordsCount);
  });

  // cy.wait("@getGroups").should((intercept) => {
  //   expect(intercept.response.statusCode).to.eq(200);
  //   expect(intercept.response).to.have.property("body");
  //   expect(intercept.response.body).to.be.a("array");
  //   if (group !== "ALL") {
  //     expect(intercept.response.body).to.include(group);
  //   }
  // });

  cy.get(".p-2 > .mx-2")
    .select(group)
    .should("contain.text", group);

  // Click UPDATE TABLE button
  cy.get("[data-cy=btn-update-table]").click();

  cy.get(`${colSelector}(25)`)
    .filter(`:contains("${status}")`)
    .as("visibility");

  cy.get(`${colSelector}(26)`).as("sharedWith");

  if (group !== "ALL") {
    if (action === "Share with groups") {
      cy.get(`${colSelector}(26)`)
        .filter(`:contains("${group}")`)
        .as("sharedWith");
    } else {
      cy.get(`${colSelector}(26)`)
        .filter(':contains("None")')
        .as("sharedWith");
    }
  }

  // TODO
  // figure out how to test multiple groups
  // let selector = ":contains("cnag"):contains("crg")"

  if (action === "Unshare with groups") {
    if (group == "ALL") {
      const selector = `:contains("${group}")`;
      cy.get(`${colSelector}(25)`)
        .not(selector)
        .as("sharedWith");
    } else {
      cy.get(`${colSelector}(25)`)
        .not(`:contains("${group}")`)
        .as("sharedWith");
    }
  }

  cy.get("@recordsCount").then((recordsCount) => {
    cy.get("@visibility").then((elements) =>
      expect(elements.length).to.eq(recordsCount)
    );
  });

  cy.get("@recordsCount").then((recordsCount) => {
    cy.get("@rowsPerPageCount").then((rowsPerPageCount) => {
      cy.get("@sharedWith").then((elements) => {
        // (un)share with all groups does not change col shared_with
        // but only changes col visibility
        if (group == !"ALL") {
          if (action === "Share with groups") {
            expect(elements.length).to.eq(recordsCount);
          } else {
            expect(elements.length).to.eq(rowsPerPageCount - recordsCount);
          }
        }
      });
    });
  });
});

Cypress.Commands.add("downloadSubmissionTemplate", (arg) => {
  // TODO
  cy.intercept("GET", `${Cypress.env("apiUrl")}/template?arg=${arg}`, {
    statusCode: 200,
  });
  cy.findByText("DOWNLOAD TEMPLATE")
    .should("exist")
    .should("be.visible")
    .click();

  const path = require("path");

  let step = 0;
  if (arg === "dataset") {
    step = 1;
  } else if (arg === "file") {
    step = 2;
  }

  cy.readFile(
    path.join(Cypress.config("downloadsFolder"), `step${step}-${arg}.xlsx`)
  );
});
