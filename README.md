# Transitlog-server

This is the server component of [Transitlog UI](https://github.com/HSLdevcom/transitlog-ui) and, in the future, other projects that need the data this server provides.

## What it does

The goal is to combine and analyze data from both the [JORE history API](https://github.com/HSLdevcom/jore-history-graphql) as well as the HFP history API. In the beginning, all data processing was done in the Transitlog UI which wasn't ideal. The amount of data is very large and it would make the UI lag as the user triggered fetches. Thus we moved all general JORE and HFP queries to this server, to filter the data, combine it, and deliver a unified GraphQL API that provides fully processed data that the UI can render.

Transitlog-server will also provide (and enable) new features that are not currently available in the UI, such as traffic flow visualization with history, calculated from the HFP data.

In the future, other HSL projects such as "Bultti" will need the same data for reporting, so that application can use this server as well.

## Technologies

The server is a Typescript app that runs on a recent version of Node (10+). It uses Apollo-Server to implement a GraphQL API and Redis for the cache backend. Familiarity with Node, Typescript and Apollo-Server (or GraphQL API's in general) is great to have before diving into the code.

## GraphQL API

Please see QUERIES.md for a more detailed description of what queries the Transitlog-Server provides. This is mainly a read-only API and it does not provide mutations for the main data. To mutate the data you have to be a bus with an HFP transmitter or use the JORE database interface.

The mutations that are available are only for the feedback feature.

## Architecture

Transitlog-Server is built around the requirements of the Reittiloki service and what kind of data that Transitlog-UI requires. Since it uses GraphQL, it mostly follows the pattern natural to a GraphQL API.

Each query in the schema has a resolver, but Transitlog-Server does not use nested field resolvers. Instead, each query is resolved by a `Creator` function that receives planned and observed data, processes it, combines it and caches it for future requests. The job of the resolver method itself is to tie this pipeline together by providing the creator function with the data.

The Creator functions, contained in `src/creators`, are central to Transitlog-Server and all queries have their own Creator function. While they can be large functions, the data is processed through them in a linear way that enables returning early if some required part of the data is unavailable. They also return cached data if found. The final return value of a Creator is an array of the fully processed data objects.

A Creator functions processes the data like this:

1. The Creator is called with data dependencies by the resolver. All database data dependencies are provided as functions, since it should not be fetched unless not found in the cache.
2. A cache key based on the parameters of the query is created and the cache is queried separately for planned (JORE) and observed (HFP) data each with the key.
3. If not found in cache, the data fetcher for the data is called. The fetcher creates the data that goes into the cache. The key is to cache as much as possible without caching results that are not applicable to future queries.
4. The data fetcher function calls the data dependency function of the data that it should fetch and receives a result. Empty results are not cached.
5. The data fetcher function validates the data and processes it as much as possible. Often it calls the Object factory function (`src/objects`) which creates the final data objects. The return is then cached.
6. Once both planned and observed data is fetched, from the cache or otherwise, they are further processed and combined. If the final data objects were not created by the fetched, they are created now.
7. The data objects are returned and the query is resolved.

In summary, the important bits of Transitlog-Server are the resolvers, the data sources (`src/datasources`), the Creators and the Object factories.

## Run the server

To run the app you need a recent version of Node. The app uses a Redis cache, so you need to either run one locally with Docker or connect to a Redis server. It also talks directly to the JORE History database, so you need that running locally or available for connection.

### 1. Start the Redis cache

```bash
docker run -p 0.0.0.0:6379:6379 --name transitlog-redis -d --rm redis:latest
```

If, for whatever reason, you need to reset or refresh the cache just recreate the container. All the data will be gone if you don't use a volume.

Alternatively, use an Azure redis server.

### 2. Connect to Postgres

Both JORE and HFP data are served from the same Citus cluster. Ensure that your IP is whitelisted for the postgres server in Azure.

### 3. Adjust your env settings

Copy the `.env.production` file into simply `.env` and adjust your environment settings as needed. You need to at least set:

- Postgres connection to point to the Citus cluster, either dev or prod
- Redis connection to point to a redis server
- PATH_PREFIX to '/'
- CLIENT_SECRET and TESTING_CLIENT_SECRET
- REDIRECT_URL to point to your locally-running Transitlog UI (presumably http://localhost:3000)
- The domain part of ADMIN_REDIRECT_URI to point to your locally-running Transitlog Server (presumably http://localhost:4000)
- API_CLIENT_SECRET

The rest can be as they are in the .env.production file or are optional for local development. You can find values for all of these in the deployment repos.

### 4. Develop

1. Run `yarn` to install dependencies
2. Run `yarn start` to start the server in watch mode.

If you change the GraphQL schema, run `yarn run codegen` to update the types.

### 5. Production

Run `yarn production` to start a Forever process that runs the server in production mode.

### 6. Docker

To run the whole server as a Docker container, first build the container:

```bash
docker build -t hsldevcom/transitlog-server .
```

Then run it:

```bash
docker run -p 0.0.0.0:4000:4000 --env REDIS_HOST=transitlog-redis --name transitlog-server hsldevcom/transitlog-server
```

The `.env.production` file will be used as the `.env` config automatically.

## Deployment

To deploy a new version of Transitlog Server to an environment, first build a Docker image and push it to the Docker Hub. Then run the pipeline in the deployment repo.

If you are following the deployment branch procedure with Github actions as outlined in the Transitlog UI documentation, read on.

### Build production image

Use one of these scripts to build and push an image to the environment of your choosing, or all environments. Before running the script, ensure that you are logged in to Docker hub through Docker as the script will try to push the image.

#### `./deploy-env.sh`

A custom build script that builds a Docker image for a specific environment. When asked, press the number for the environment you want to build for.

#### `./deploy-all.sh`

Builds and tags Docker images for all environments.

### Deployment repos

The app is deployed to a Docker swarm running on Azure. The deployment itself is managed by Gitlab pipelines, one repo for each environment. This repo also contains the service configuration for the app in the swarm, as well as the nginx configuration.

After you've built and pushed an image for an environment, run the pipeline in the corresponding deployment repo:

- Dev: https://gitlab.hsl.fi/transitlog/transitlog-app-dev-deploy

- Stage: https://gitlab.hsl.fi/transitlog/transitlog-app-stage-deploy

- Prod: https://gitlab.hsl.fi/transitlog/transitlog-app-prod-deploy

### Merge into environment branches

Once you are finished with an update, merge `master` into the `staging` and `staging` into the `production` branch as the update is tested and approved. This is important, as the Github Actions workflow (outlined in the Transitlog UI docs) also builds and pushes the server app based on code from these branches. If the staging and production branches are not updated, the server will potentially be downgraded as a result of using the Github actions workflow.

### Github actions

The server repo does not have Github actions workflows, but the actions workflows of the UI repo will pull, build and push a new Docker image based on the code in the `staging` and `production` branches. See the Transitlog UI repo for an outline of the Github Actions workflow.

## Useful commands

#### `yarn start`

Starts the server in development mode with change watches.

#### `yarn run codegen`

Updates the Typescript types from the schema. ALWAYS RUN THIS after changing the schema!
