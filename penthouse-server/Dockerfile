# production environment
FROM node:12.18.0-buster-slim@sha256:97da8d5023fd0380ed923d13f83041dd60b0744e4d140f6276c93096e85d0899

# replace shell with bash so we can source files
#RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# set working directory
WORKDIR /usr/src/app

RUN  apt-get update \
     && apt-get install -y wget gnupg ca-certificates \
     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
     && apt-get update \
     # We install Chrome to get all the OS level dependencies, but Chrome itself
     # is not actually used as it's packaged in the node puppeteer library.
     # Alternatively, we could could include the entire dep list ourselves
     # (https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix)
     # but that seems too easy to get out of date.
     && apt-get install -y google-chrome-stable \
     && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY . /usr/src/app
RUN touch .env

RUN apt-get update \
    && apt-get install -y build-essential \
    && yarn install --quiet node-gyp -g \
    && yarn install --quiet \
    && apt-get remove -y build-essential \
    && apt autoremove -y \
    && rm -rf /var/lib/apt/lists/*

RUN yarn build

EXPOSE $PORT
CMD ["yarn", "start"]