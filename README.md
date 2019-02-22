# Transitlog-server

This is the server component of [Transitlog UI](https://github.com/HSLdevcom/transitlog-ui) and, in the future, other projects that need the data this server provides.

## What it does

The goal is to combine and analyze data from both the [JORE history API](https://github.com/HSLdevcom/jore-history-graphql) as well as the HFP history API. As I am writing this, the server is in very early stages and all data processing is done in the Transitlog UI which isn't ideal. The amount of data is very large and it will make the UI lag as the user triggers fetches. Thus we want to move all general JORE and HFP queries to this server, filter the data, combine it, and deliver a unified GraphQL API that provides fully processed data that the UI can render.

Transitlog-server will also provide (and enable) new features that are not currently available in the UI, such as traffic flow visualization with history, calculated from the HFP data.

In the future, other HSL projects such as "Bultti" will need the same data for reporting, so that application can use this server as well.

## Technologies

The server is a Typescript app that runs on a recent version of Node (10+). It uses Apollo-Server to implement a GraphQL API and Redis for the cache backend. Familiarity with Node, Typescript and Apollo-Server (or GraphQL API's in general) is great to have before diving into the code.

## GraphQL API

Please see QUERIES.md for a more detailed description of what queries the Transitlog-Server provides. This is a read-only API and it does not provide mutations. To mutate the data you have to be a bus with an HFP transmitter or use the JORE database interface.

## Run the server

To run the app you need a recent version of Node. The app uses a Redis cache that runs on Docker, so have that installed too.

### 1. Start the Redis cache

```bash
docker run -p 0.0.0.0:6379:6379 --name transitlog-redis -d --rm redis:latest
```

### 2. Develop

1. Run `yarn` to install dependencies
2. Run `yarn start` to start the server with Nodemon in watch mode.

`yarn start` will also start graphql-code-generator in watch mode which creates Typescript types as you develop the schema.

### 2. Production

Run `yarn production` to start a Forever process that runs the server in production mode.

### 2. Docker

TBD
