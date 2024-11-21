FROM node:22.11.0-alpine3.20 AS base

# Install a chosen NPM version
ENV NPM_VERSION=10.3.0
RUN npm install -g npm@"${NPM_VERSION}"

# Install dependencies only when needed
FROM base AS deps


WORKDIR /usr/src/app

COPY package*.json .

RUN npm install --no-audit

COPY . .



FROM ghcr.io/puppeteer/puppeteer:21.0.2

ARG NODE_ENV=production

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci

COPY --from=base /usr/src/app/dist ./dist

CMD ["node","dist/app.js"]