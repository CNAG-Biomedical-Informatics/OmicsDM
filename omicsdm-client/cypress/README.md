# Automated testing using Cypress

Cypress can be used for component/functional/visual and end-to-end testing of the user interface (React application).
This guide shows how to set it up, configure it, install plugins, enable keycloak login, get test coverage, integrate it in Jenkins etc.
It is based on the automated testing of  the 3TR-client (https://github.com/bag-cnag/3TR-client)  and the end-to-end testing (https://github.com/bag-cnag/3TR-e2e)

## Step-by-step guide

Requirements:
For component testing, the React application needs to be bundled by webpack (version: >  5.0)

### Install cypress (and plugins)
 1. Add Cypress and its plugins under dev dependencies in the package.json (https://github.com/bag-cnag/3TR-client/blob/master/package.json)

	```
	"devDependencies": {
		"@cypress/code-coverage": "^3.9.11",
		"@cypress/react": "^5.9.3",
		"@cypress/webpack-dev-server": "^1.7.0",
		"cypress": "^8.7.0",
		"cypress-failed-log": "^2.9.2",
		"cypress-file-upload": "^5.0.8",
		"cypress-keycloak-commands": "^1.2.0",
		"cypress-log-to-output": "^1.1.2",
		"cypress-multi-reporters": "^1.5.0",
		"@testing-library/cypress": "^8.0.1",
	}
	```

2. Install the packages above with npm install

3. Add cypress to the scripts in the package.json
eg "cy:open" : "cypress open" and "cy:run": "cypress run"

4. Run cypress with npm run cy:open to generate the default Cypress folder structure

	![cypress folder structure](https://testersdock.b-cdn.net/wp-content/uploads/2020/08/folder-structure.png.webp)
	https://testersdock.com/cypress-folder-structure/



5. Import the cypress plugins in support/commands.js (https://github.com/bag-cnag/3TR-client/blob/master/testing/cypress/support/commands.js)
	```
	import "@testing-library/cypress/add-commands";
	import "@cypress/code-coverage/support";
	import "cypress-keycloak-commands";
	import "cypress-file-upload";
	```
6. Configure the Cypress plugins in plugins/index.js (https://github.com/bag-cnag/3TR-client/blob/master/testing/cypress/plugins/index.js)

7. Configure Cypress in cypress.json (https://github.com/bag-cnag/3TR-client/blob/master/testing/cypress/cfg.json)

8. Create your first test cases in integration/ (https://github.com/bag-cnag/3TR-client/tree/master/testing/cypress/integration)


#### Enable Keycloak Login

For login to the application two different ways are possible.
Either a fake login using https://github.com/Fredx87/cypress-keycloak-commands  or 
a real login (https://github.com/bag-cnag/3TR-e2e/blob/main/cypress/support/commands.js)

Pro and cons of fake login vs real login

fake login | real login
---|---|
requires an additional dependency (cypress plugin) |	no plugin needed
login can be done before all tests of one test file  |	login can be done before all tests of one test file 
lasts as long as set in the keycloak admin console |	login needs to be repeated after each page change
requires username and a bash script talking to generate | the access tokens 	requires username and password
cannot be used for end-to-end testing |	can be used for end-to-end testing

Personal opinion:
I would suggest to use the fake login for functional/visual testing and the real login for end-to-end testing

#### How to set up the "fake login"

1. Install "cypress-keycloak-commands": "^1.2.0",

2. Add Cypress.env.json ! Do not forget to add it to .gitignore
	```
	{
		"apiUrl": "https://3tr.cnag.crg.dev/omics_datamanagement_service/api",
		"auth_base_url": "https://sso.cnag.crg.dev/auth/",
		"auth_realm": "3TR",
		"auth_client_id": "submission_client",
		"auth_username": "test",
		"coverage": true
	}
	```


3. Create a file for the keycloak credentials (kc.env) !Do not forget to add it to .gitignore
	```
	HOST="sso.cnag.crg.dev"
	REALM="3TR"
	USERNAME="test"
	PASSWORD="<password>"
	CLIENT_ID="submission_client"
	```

4. Create a fake login information file fixtures/users/test.json
	```
	'{fakeLogin:{account:{},access_token:}}')
	```
5. Add the bash script to generate the access_token for the fake login file (https://github.com/bag-cnag/3TR-client/blob/master/getKCTokens.sh)

6. Add bash getKCTokens.sh to the scripts of package.json (https://github.com/bag-cnag/3TR-client/blob/master/package.json)

7. Add keycloak fake login to the before all hook of any cypresses test file (https://github.com/bag-cnag/3TR-client/blob/master/testing/cypress/integration/fakeKC.spec.js)
cy.kcFakeLogin(Cypress.env("auth_username"),"#/login/?redirect=/submitdatasets");

8. Add  scripts in package.json which executes getKCTokens.sh before running the tests (https://gist.github.com/pulkitsinghal/d53ad3538e153e6003a99139715beed3)


How to set up the "real login"

1. Add Cypress.env.json ! Do not forget to add it to .gitignore
	```
	{
	"auth_username": "test",
	"auth_password":"<password>,
	"coverage": true
	}
	```
2. Add a custom command to support/commands.js (https://github.com/bag-cnag/3TR-e2e/blob/main/cypress/support/commands.js)

3. Make sure that "chromeWebSecurity" in cypress.json is set to false otherwise the keycloak login form can't be filled in (https://github.com/bag-cnag/3TR-client/blob/master/testing/cypress/cfg.json) 

4. Add the custom login command in the cypress test files before each page change (https://github.com/bag-cnag/3TR-e2e/blob/main/cypress/integration/submitFiles.test.js)

	```
	cy.login()
	cy.visit(`${Cypress.config("baseUrl")}/#/submitdatasets`)
	```

Get cypress test coverage:

1. Add "@cypress/code-coverage": "^3.9.11" to package.json

2. In Cypress.env.json set coverage to true ! Do not forget to add it to .gitignore
	```
	{
	"auth_username": "test",
	"auth_password":"<password>,
	"coverage": true
	}
	```
3. In plugins/index.js enable code coverage (https://github.com/bag-cnag/3TR-client/blob/master/testing/cypress/plugins/index.js)
const codeCoverageTask = require('@cypress/code-coverage/task');

4. Add "babel-plugin-istanbul": "^6.0.0" to package.json for instrumenting the code (https://docs.cypress.io/guides/tooling/code-coverage#Instrumenting-code)

5. Create .babelrc in the source folder to enable code instrumentation on  the fly (https://github.com/bag-cnag/3TR-client/blob/ce8a6d12e5d21b98b81fc428c8d880d66f6fa978/src/.babelrc)

6. Add NYC config in package.json (https://github.com/bag-cnag/3TR-client/blob/master/package.json)
	```
	"nyc": {
		"report-dir": "testing/cypress/coverage",
		"reporter": ["lcov","json-summary","cobertura"]},
	```
#### Integrate cypress test results and test coverage into Jenkins

Prerequisites:
non root version (by Daniel Pico) of the cypress included Docker (https://github.com/cypress-io/cypress-docker-images)
rdregistry1.rd-connect.eu:5000/cypress:8.3.0-included-nonroot

1. Add kc.env,cypress.env.json and cypress.json to Gitea (https://172.16.10.100/gitea/platform/3tr_client_config/src/branch/release_3tr)
2. Add the stage cypress testing to the Jenkinsfile (https://github.com/bag-cnag/3TR-client/blob/release/Jenkinsfile)

Good to know:
The baseUrl in cypress.json on gitea is the internal IP of Jenkins + the port of the client to be tested.
! Before running your test on cypress make sure that your ports are not already in use by someone else
Otherwise this is going to clash on Jenkins if two clients with the same port are tested on the same time.