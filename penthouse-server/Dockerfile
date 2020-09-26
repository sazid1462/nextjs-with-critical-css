# production environment
FROM node:12.18.0-buster-slim@sha256:97da8d5023fd0380ed923d13f83041dd60b0744e4d140f6276c93096e85d0899

# replace shell with bash so we can source files
#RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# set working directory
WORKDIR /usr/src/app

# Copy application files
COPY . /usr/src/app
RUN touch .env

RUN  apt-get update \
    && apt-get install -y wget gnupg ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    # Install Google Chrome for Puppeteer to use to render pages while generating CSS
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    # Now install the app dependencies.
    && apt-get install -y build-essential \
    && yarn install --quiet node-gyp -g \
    && yarn install --quiet \
    && apt-get remove -y build-essential \
    && apt autoremove -y \
    && rm -rf /var/lib/apt/lists/*

RUN yarn build

EXPOSE $PORT
CMD ["yarn", "start"]
