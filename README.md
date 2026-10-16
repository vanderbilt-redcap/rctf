# REDCap Cypress Test Framework (RCTF)

This repository is a fork of https://github.com/vanderbilt-redcap/rctf. 

A node package that powers automated testing of REDCap in Cypress.  This library is utilized by the [CCTC REDCap Cypress Test Suite](https://github.com/CCTC-team/redcap_cypress/blob/redcap_val/README.md).

---

## Who are we

The Cambridge Cancer Trials Centre (CCTC) is a collaboration between Cambridge University Hospitals NHS Foundation Trust, the University of Cambridge, and Cancer Research UK. Founded in 2007, CCTC designs and conducts clinical trials and studies to improve outcomes for patients with cancer or those at risk of developing it. In 2011, CCTC began hosting the Cambridge Clinical Trials Unit - Cancer Theme (CCTU-CT).

CCTC has two divisions: Cancer Theme, which coordinates trial delivery, and Clinical Operations.

## How do we test the tests?

We have started creating [unit tests for some step definitions](https://github.com/vanderbilt-redcap/rctf/tree/main/tests) to ensure that they perform the expected actions. We are currently prioritizing steps that verify the presence or absence of elements on the screen, as that type of step has the potential to fail silently.

## Code Coverage in VS Code

- Install the Coverage Gutters extension in VS Code
- Run `./run.sh`, then run a feature (e.g. `visibility.cy.js`)
- Run the `Coverage Gutters: Display Coverage` command in VS Code to see code coverage.
