FROM node:12-alpine

ENV WORK /opt/transitlog

# Create app directory
RUN mkdir -p ${WORK}
WORKDIR ${WORK}

# Install app dependencies
COPY yarn.lock ${WORK}
COPY package.json ${WORK}
RUN yarn

# Bundle app source
COPY . ${WORK}
COPY .env.production ${WORK}/.env

RUN yarn run build

EXPOSE 4000

CMD yarn run start:production
