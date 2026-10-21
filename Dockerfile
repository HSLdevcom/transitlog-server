FROM node:22-bookworm-slim

# TODO: Use node:22.23.4-alpine once its official Docker image has platform manifests.
ARG TARGETARCH=amd64

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl xz-utils \
    && rm -rf /var/lib/apt/lists/*

RUN set -eux; \
    case "$TARGETARCH" in \
      amd64) NODE_ARCH=x64; NODE_SHA256=1805bcd35e6815559bd2eb97db438d3fdb0eb3a5e6a977b7c1badca76337e9ce ;; \
      arm64) NODE_ARCH=arm64; NODE_SHA256=6287aa46b6c375d816e63ae66d024fbbfd70404825aabdfdf898a970871d2f4b ;; \
      *) echo "Unsupported target architecture: $TARGETARCH" >&2; exit 1 ;; \
    esac; \
    curl -fsSL "https://nodejs.org/dist/v22.23.4/node-v22.23.4-linux-${NODE_ARCH}.tar.xz" -o /tmp/node.tar.xz; \
    echo "$NODE_SHA256  /tmp/node.tar.xz" | sha256sum -c -; \
    tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1; \
    rm /tmp/node.tar.xz; \
    node --version | grep -Fx "v22.23.4"

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
