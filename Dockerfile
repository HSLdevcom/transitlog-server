# syntax=docker/dockerfile:1
# check=error=true

FROM node:22-slim AS build
WORKDIR /usr/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build


FROM build AS tester
ENTRYPOINT ["npm", "run", "test:ci"]


FROM node:22-slim AS production
WORKDIR /usr/app
COPY --from=build /usr/app/dist ./dist
COPY --from=build /usr/app/node_modules ./node_modules
COPY --from=build /usr/app/package.json ./package.json
EXPOSE 4000
ENV NODE_ICU_DATA=node_modules/full-icu
ENTRYPOINT ["node", "-r", "dotenv/config", "dist/server.js"]