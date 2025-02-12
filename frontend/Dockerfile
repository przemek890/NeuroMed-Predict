# Stage 1: Build Stage
FROM node:23-alpine AS builder

WORKDIR /builder

COPY package*.json tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

RUN chmod +x runtime-env.sh
RUN chmod +x entrypoint.sh

# Stage 2: Production Stage
FROM node:23-alpine AS app

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /builder/build ./build
COPY --from=builder /builder/runtime-env.sh ./
COPY --from=builder /builder/entrypoint.sh ./

RUN mkdir /SSL

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
