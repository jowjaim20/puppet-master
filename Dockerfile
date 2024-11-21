FROM node:22-alpine as development

RUN npm install -g npm@latest


WORKDIR /usr/src/app

COPY package*.json .

RUN npm install --verbose 

COPY . .

RUN npm run build

FROM node:22-alpine AS production

FROM ghcr.io/puppeteer/puppeteer:21.0.2

ARG NODE_ENV=production

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci --omit=dev

COPY --from=development /usr/src/app/dist ./dist

CMD ["node","dist/app.js"]