FROM ghcr.io/puppeteer/puppeteer:21.0.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable


COPY package*.json ./
RUN npm ci
COPY . .    


WORKDIR ./dist

CMD node app.js