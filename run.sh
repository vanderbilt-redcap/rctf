#!/usr/bin/env bash

set -e

npx cypress open --e2e --browser chrome --env codeCoverage=true