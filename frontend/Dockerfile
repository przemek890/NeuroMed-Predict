# Stage 1: Build Stage
FROM node:23-alpine AS builder

WORKDIR /builder

COPY package*.json tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Production Stage
FROM node:23-alpine AS app

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /builder/build ./build

RUN mkdir /SSL

EXPOSE 3000

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
