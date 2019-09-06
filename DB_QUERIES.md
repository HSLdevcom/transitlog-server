# `vehicles` table

All dates and other WHERE values are for demonstration purposes only.

## All vehicles in traffic for a day

```postgresql
SELECT distinct on (unique_vehicle_id) unique_vehicle_id,
vehicle_number,
owner_operator_id
FROM vehicles
WHERE oday = '2019-09-04'
ORDER BY unique_vehicle_id;
```

## Get all events within an area

```postgresql
SELECT *
FROM vehicles
WHERE oday = '2019-09-04'
  AND geohash_level <= 4 -- Limit the amount of data coming into the app
  AND tsi BETWEEN 1567756800 AND 1567760400
  AND lat BETWEEN 60.16721 AND 60.17459
  AND long BETWEEN 24.93364 AND 24.95029
ORDER BY tst ASC;
```

## Get all events from a specific vehicle for the day

This can probably be optimized. We only need the start of each journey, but as that is done in application code we need to fetch ALL events for the day for this vehicle ID.

The start of the journey is when the vehicle departs the first stop, but the event stream will start coming from the vehicle as soon as the driver signs in. Thus, the "start of the journey" event is not simply the first event, but some event near the beginning when the next_stop_id value changes for the first time.

```postgresql
SELECT *
FROM vehicles
WHERE oday = '2019-09-04'
  AND unique_vehicle_id = '0022/1143'
ORDER BY tst ASC;
```

## Get all events for a route by day

All events drawn on map but can be less precise (which is why the data is limited with the geohash_level).

```postgresql
SELECT *
FROM vehicles
WHERE oday = '2019-09-04'
  AND geohash_level <= 4
  AND route_id = '2510'
  AND direction_id = 1
ORDER BY tst ASC;
```

## Get all events for a specific journey

A journey is defined by: route_id, direction_id, oday and journey_start_time. All events from this query will be drawn on the map so we need all the data.

```postgresql
SELECT *
FROM vehicles
WHERE oday = '2019-09-04'
  AND route_id = '2510'
  AND direction_id = 1
  AND journey_start_time = '06:40'
  AND unique_vehicle_id = '0022/1143'
ORDER BY tst ASC;
```

## Get departure times for a specific stop

```postgresql
SELECT DISTINCT ON ("journey_start_time", "unique_vehicle_id") *
FROM vehicles
WHERE oday = '2019-09-04'
  AND next_stop_id = '1173125'
ORDER BY journey_start_time ASC, unique_vehicle_id ASC, tst DESC;
```

## Get departure times for a specific stop and route

```postgresql
SELECT DISTINCT ON ("journey_start_time", "unique_vehicle_id") *
FROM vehicles
WHERE oday = '2019-09-04'
  AND next_stop_id = '1431187'
  AND route_id = '2510'
  AND direction_id = 1
ORDER BY journey_start_time ASC, unique_vehicle_id ASC, tst DESC;
```

## Get weekly departure times for a specific stop and route

```postgresql
SELECT DISTINCT ON ("oday", "journey_start_time", "unique_vehicle_id") *
FROM vehicles
WHERE oday BETWEEN '2019-09-02' AND '2019-09-08' -- The week boundary
  AND next_stop_id = '1431187'
  AND route_id = '2510'
  AND direction_id = 1
ORDER BY oday ASC, journey_start_time ASC, unique_vehicle_id ASC, tst DESC;
```

# `alert` table

## Get all alerts during a time

```postgresql
SELECT *
FROM alert
WHERE valid_from BETWEEN '2019-09-04T06:00:00Z+03:00' AND '2019-09-04T07:00:00Z+03:00'
ORDER BY valid_from ASC, valid_to ASC, last_modified DESC;
```

# `cancellation` table

## Get all cancellations during a time

```postgresql
SELECT *
FROM cancellation
WHERE start_date = '2019-09-04'
ORDER BY last_modified DESC, start_time ASC;
```
