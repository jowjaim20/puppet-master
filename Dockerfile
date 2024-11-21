FROM node:22.10.0 AS  development




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

RUN npm ci --omit=dev --force

COPY --from=development /usr/src/app/dist ./dist

CMD ["node","dist/app.js"]