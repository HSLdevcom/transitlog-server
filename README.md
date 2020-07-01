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

## Run the server

To run the app you need a recent version of Node. The app uses a Redis cache, so you need to either run one locally with Docker or connect to a Redis server. It also talks directly to the JORE History database, so you need that running locally or available for connection.

### 1. Start the Redis cache

```bash
docker run -p 0.0.0.0:6379:6379 --name transitlog-redis -d --rm redis:latest
```

If, for whatever reason, you need to reset or refresh the cache just recreate the container. All the data will be gone if you don't use a volume.

Alternatively, use an Azure redis server.

### 2. Connect to Postgres

Both JORE and HFP data are served from the same Citus cluster. Ensure that your IP is whitelisted for the postgres server in Azure and enter the connection info in the .env file.

### 3. Adjust your env settings

Copy the `.env.production` file into simply `.env` and adjust your environment settings as needed. You probably need to change the `PG_CONNECTION_STRING` variable depending on how you set up the JORE History database in the previous section.

As of writing, this is the default production ENV settings:

```dotenv
TZ=Europe/Helsinki
DATE_FORMAT=YYYY-MM-DD
TIME_FORMAT=HH:mm:ss
MAX_JORE_YEAR=2050
JORE_URL=https://dev-kartat.hsldev.com/jore-history/graphql
HFP_URL=https://sandbox-1.hsldev.com/v1alpha1/graphql
REDIS_HOST=0.0.0.0
PG_CONNECTION_STRING=postgres://postgres:postgres@jore-history-postgis:5432/postgres
# DEBUG=true
```

If you use a local database, set the following `PG_CONNECTION_STRING`:

```dotenv
PG_CONNECTION_STRING=postgres://postgres:mysecretpassword@localhost:5432/postgres
```

Remember to change the password if you used a different password than what is described in the database repo's README.

If you used an SSH tunnel, set the following `PG_CONNECTION_STRING`:

```dotenv
PG_CONNECTION_STRING=postgres://postgres:postgres@localhost:5432/postgres
```

Uncomment `DEBUG=true` to print all Postgres queries that run into console.

### 4. Develop

1. Run `yarn` to install dependencies
2. Run `yarn start` to start the server with Nodemon in watch mode.

`yarn start` will also start graphql-code-generator in watch mode which creates Typescript types as you develop the schema.

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
