#!/bin/bash

for spec in cypress/e2e/*.cy.js; do
    filename=$(basename "$spec" .cy.js)
    echo "Running test: $filename"

    npx cypress run \
        --spec "$spec" \
        --config-file cypress.config.js
done

echo "Merging JSON reports..."
npx mochawesome-merge /app/cypress/logs/json/*.json > /app/cypress/logs/combined-report.json

echo "Generating HTML report..."
npx mochawesome-report-generator /app/cypress/logs/combined-report.json --reportDir /app/cypress/logs

echo "Process completed. Reports have been generated in the /app/cypress/logs directory"