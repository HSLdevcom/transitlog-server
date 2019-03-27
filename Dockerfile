FROM node:11-alpine

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

EXPOSE 4000

CMD yarn run start:production
