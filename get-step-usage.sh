#!/usr/bin/env bash

npx cucumber-js -r step_usage.js ../redcap_cypress_docker/redcap_cypress/redcap_rsvc/Feature\ Tests/
# The following line is helpful instead of the above line when troubleshooting individual steps
# npx cucumber-js -r step_usage.js ../redcap_cypress_docker/redcap_cypress/cypress/features

if [ $? -eq 0 ]; then
    echo "Step usage was written to step-usage.json.  Hopefully soon we will incorporate these counts into the docs instead."
else
    # This file since an error occured and it is incomplete 
    rm step-usage.json
fi