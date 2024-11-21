FROM node:22.11 AS development

# Install a chosen NPM version
ENV NPM_VERSION=10.3.0
RUN npm install -g npm@"${NPM_VERSION}"

# Install dependencies only when needed


WORKDIR /usr/src/app

COPY package*.json .

RUN  npm install --loglevel verbose

COPY . .



FROM ghcr.io/puppeteer/puppeteer:22.4.1

ARG NODE_ENV=production

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci --omit=dev

COPY --from=development /usr/src/app/dist ./dist

CMD ["node","dist/app.js"]