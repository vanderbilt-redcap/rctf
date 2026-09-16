# REDCap Cypress Test Framework (RCTF)

A node package that powers automated testing of REDCap in Cypress. This library is utilized by the [REDCap Cypress Developer Toolkit](https://github.com/vanderbilt-redcap/redcap_cypress_docker/blob/main/README.md). The Cypress step definitions defined here are utilized by the  toolkit and its related repos.

## How do we test the tests?

We have started creating [unit tests for some step definitions](https://github.com/vanderbilt-redcap/rctf/tree/main/tests) to ensure that they perform the expected actions. We are currently prioritizing steps that verify the presence or absence of elements on the screen, as that type of step has the potential to fail silently.

## Code Coverage in VS Code

- Install the Coverage Gutters extension in VS Code
- Run `./run.sh`, then run a feature (e.g. `visibility.cy.js`)
- Run the `Coverage Gutters: Display Coverage` command in VS Code to see code coverage.