# Provided queries

This document outlines the data that Transitlog-Server provides through GraphQL queries and what input they need.

Transitlog-Server does not forward any types from JORE-history or the HFP API, instead it provides an all-new schema with preprocessed data. Some data will be pretty similar to what either API provides in the interest of not needing to connect to multiple API's in the UI.

### Custom types

The Transitlog schema includes some custom types:

- `Date`: a Date string in YYYY-MM-DD format. The timezone is by default Finnish, but this can be set with environment variables.
- `Time`: a time string in HH:mm:ss format. Since we are dealing with 24h+ times, the time is not a clock time, but a duration of seconds from 00:00:00. Thus the hour component can go beyond 23. This is usually paired with a Date property, otherwise we couldn't calculate the real-world time.
- `DateTime`: a datetime string in ISO 8601 format YYYY-MM-DDTHH:mm:ssZ. If received with a timezone, the timezone will be converted to the app timezone. In response data the timezone will always be set to the app timezone.
- `VehicleId`: A string that uniquely identifies a vehicle. The format is [operator ID]/[vehicle ID]. The operator ID is padded to have a length of 4 characters.
- `Direction` enum: an enum that is either `D1` or `D2`.
- `BBox`: a string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's latLngBounds.toBBoxString() returns.

### Queries

All the queries that are or will be provided by this API. Together they cover the full range of use cases for Transitlog. The queries are described with pseudo-graphQL and a text description.

```
ParentObject.queryName(
  argumentName: argumentType = StaticDefaultValue
  argumentName: argumentType = [computed default value]
): [ReturnObjectType]
```

If there is a default value set for an argument, you can usually pass `false` if you don't want the query to use the argument. This is not possible for required values.

#### equipment

```
Query.equipment(
  filter: {
    vehicleId: String
    operatorId: String
    search: String
  }
  date: Date
): [Equipment]
```

The equipment query returns data on the vehicles active in the HSL network. The result can be filtered by the vehicle and operator ID or a search string. If a vehicle or operator ID is provided they will override the search string which will not be used. The search string will match the vehicle ID, operator ID and/or registry number. If a date is provided, the result will be compared against the HFP data from that date to determine the value of the `inService` property of the `Equipment` type that tells us if the vehicle was in service on that date.

API: Jore, HFP

#### stops

```
Query.stops(
  filter: {
    search: String
    bbox: BBox
  }
): [Stop]
```

The stops query returns a list of stops, optionally filtered by a search term OR a BBox. The search term matches against the stop ID, the short ID or the finnish stop name.

API: Jore

#### routes

```
Query.routes(
  filter: {
    routeId: String
    direction: Direction
  },
  date: Date = [current date]
): [Route]
```

The routes query returns a list of routes, optionally filtered by the routeId and direction. Provide the Date variable if you want to only receive routes that were valid on that date. Routes are filtered with "validity chains", ie a valid route needs to have a validity range that works as a "link" in the chain of route versions all the way from the first version of the route to the latest version. Chain validation is performed regardless of whether the query received the date variable.

API: Jore

#### routeGeometry

```
Query.routes(
  routeId: String!
  direction: Direction!
  date: Date! = [current date]
): RouteGeometry
```

The routeGeometry query returns the geometry for a route. All variables are required, and the geometry will be valid for the specified date and route. The route used will be chosen through chain validation.

API: Jore

#### lines

```
Query.lines(
  filter: {
    lineId: String
  },
  date: Date = [current date]
  includeLinesWithoutRoutes: Boolean = false
): [Line]
```

The lines query returns a list of lines, optionally filtered by the lineId which acts as a search term (ie all lineIds that start with the potentially partial lineId filter value are returned). Provide the date variable if you only want lines that were active during that date. Lines are also validated with validity chains like routes.

API: Jore

#### departures

```
Query.departures(
  filter: {
    routeId: String
    direction: Direction
  }
  stopId: String
  date: Date! = [current date]
): [Departure]
```

The departures query returns all journey departures for a date. Note that the date variable is required for this query. The result can be filtered by route and direction, and if a stopId is provided the data will include planned and observed departure times from that stop. Otherwise the planned and observed time will be from the origin stop of the route.

API: Jore, HFP

#### journey

```
Query.journey(
  routeId: String!
  direction: Direction!
  departureTime: Time!
  departureDate: Date! = [current date]
): Journey
```

They journey query returns one journey for a route and time, complete with observed HFP data and calculated data for each stop of the journey. For parts of the journey that does not have observed data, only planned data is returned.

API: Jore, HFP
