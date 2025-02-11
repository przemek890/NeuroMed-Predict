# Stage 1: Test Stage
FROM cypress/included:12.11.0 AS tester

WORKDIR /app

COPY . .

RUN npm install --save-dev cypress
RUN npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator

RUN chmod +x entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
