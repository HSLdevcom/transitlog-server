FROM node:20-alpine

RUN apk --no-cache add curl

ENV WORK /opt/transitlog

# Create app directory
RUN mkdir -p ${WORK}
WORKDIR ${WORK}

# Install app dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Bundle app source
COPY . ${WORK}
COPY .env.production ${WORK}/.env

RUN yarn run build

EXPOSE 4000

CMD yarn run start:production
