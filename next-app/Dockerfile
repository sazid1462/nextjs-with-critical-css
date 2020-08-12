# production environment
FROM node:14.3.0-alpine

# set working directory
WORKDIR /usr/src/app

# Copy application files
COPY . /usr/src/app
RUN touch .env

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python && \
  yarn install --quiet node-gyp -g &&\
  yarn install --quiet && \
  apk del native-deps

RUN yarn build

EXPOSE $PORT
CMD ["yarn", "start"]
