# Transitlog server changelog

## Version 1.9.1, deployed 2020-04-16 @ 15:00

- Fix route segments filter to remove invalid stops.
- Fix admin clear cache button.

## Version 1.9.0, deployed 2020-04-15 @ 08:00

- New feedback feature which posts to Slack with image upload.
- Order TLP events by requestId.
- Fix departure replacement days not being matched with HFP events in some cases.

## Version 1.8.2, deployed 2020-03-06 @ 08:00

- Use health check in Docker Swarm.

## Version 1.8.1, deployed 2020-02-20 @ 09:00

- No server changes

## Version 1.8.0, deployed 2020-02-12 @ 13:00

- Add query resolver for listing terminals.
- Enable querying for terminal timetables with the Departure query.
- Enable querying for terminals stops.
- Optimize departure database queries.
- Various smaller fixes for stop responses.

## Version 1.7.1, deployed 2020-02-04 @ 14:00

- Fix metro departure list.
- Better handling of transport modes.
- Fix journey departure to route matching.
- Fix stop departure event matching.

## Version 1.7.0, deployed 2020-02-03 @ 10:00

- Use the Citus database for JORE data.
- Fixes and updates related to the new JORE database, including removing the old JORE database and the JORE importer from the swarm.
- Improve and simplify stop query and response.
- Improve and fix weekly departures query and response.
- Fix route journeys to remove unrelated events from the result.

## Version 1.6.1, deployed 2020-01-23 @ 12:00

- Add more route info to stop routes.
- Refactor and fix journey events sorting.
- Time fix for some midnight journeys not working.
- Better handling of journeys with empty vehicle positions.
- Fix for abnormal extra_departure value from JORE.
- Add loc data to many responses.
- Some preparations for a new JORE database.

## Version 1.6.0, deployed 2020-01-17 @ 10:00

- Fix area search bug.
- Fix for some alerts not being visible.
- Add driver events (DA, DOUT) resolver and types.
- Stop creating virtual events for future stops.
- Remove PDE event fallback for missing DEP events.
- Fix event order in journey event list.
- Fix invalid departures which have new versions.
- Use new Citus database for HFP queries (deployed 2020-01-08)

## Version 1.5.5, deployed 2019-12-20 @ 11:00

- Include stops without routes in stops response.
- Fix journey events order.

## Version 1.5.4, deployed 2019-12-12 @ 12:00

- Fix edge case crash when preparing the vehicles response.

## Version 1.5.3, deployed 2019-12-12 @ 09:00

- Fix alert query to show current alerts correctly.
- Add the received_at HFP property to enable data delay inspection.
- Include operating unit (kilpailukohde) in relevant responses.

## Version 1.5.2, deployed 2019-11-26 @ 13:00

- Add skipCache functionality to more resolvers to enable more granular cache updates.
- Fix cancellations getting attached to departures of the wrong date.

## Version 1.5.1, deployed 2019-11-20 @ 10:00

- Fix admin views.

## Version 1.5.0, deployed 2019-11-20 @ 09:00

- Fixes for journey event correctness.
- Add all journey departures to the journey response.
- Add route length and route duration fields to route response.
- Mark virtual journey events as virtual.
- Cache skipping for more queries.
- Include events with null lat and long properties.
- Use PDE and ARR fallbacks for DEP and ARS events in departure lists.
- Fix session cookie security and persistence.
- Fix exception days feature.
- Trim route segments to remove stops not in route.
- Update Typescript version and other dependencies.
- Build Typescript source to JavaScript in Docker build step.
- Better handling for PAS events.
- Better handling for virtual events.

## Version 1.4.1, deployed 2019-11-06 @ 12:00

- Auto-create all groups entered in the auto-create admin config.

## Version 1.4.0, deployed 2019-11-06 @ 10:00

- New HSL ID environment.
- Use dev HSL ID environment for testing.
- Fix bug filtering out abnormal stop events from the Journey response.
- Fix differing departure times being returned for different requests for journeys with abnormal stop events.
- Fix tst time range end function which included too much of the next day.
- Implement exception and replacement day scoping in departures.
- Only show ongoing (not upcoming) events.

## Version 1.3.1, deployed 2019-10-25 @ 09:00

- Allow nullable departureTime field for Journey objects.

## Version 1.3.0, deployed 2019-10-25 @ 08:00

- Add lat and long to other journey events than VP events (vehicle position).
- Add ability for route departures query to fetch arrival to the last stop.
- Fix alert query and grouping.
- Modify the search timerange for unsigned events.
- Remove redundancies and simplify caching for many responses.
- More stop mode fixes.
- Fix, refactor and improve journey events response.
- Prune and clean up unnecessary code.
- Optimize HFP queries with time ranges.
- Require authentication and authorization for the vehicle options list.
- Various smaller fixes and improvements.

## Version 1.2.0, deployed 2019-10-08 @ 07:00

- Add skipCache feature for some requests that can circumvent and refresh the cache.
- Hide vehicle block journeys from unauthenticated users.
- Hide some sensitive departure and vehicle info from unauthenticated users.
- Refactor vehicle operator authorization code.
- Fix stop modes (stop colors).
- Fix geometry query and validation.

## Version 1.1.0, deployed 2019-10-03 @ 06:00

- Improve departures events query and GraphQL response.
- Fix metro stop event door status.
- Use the correct event type for various departure cases (DEP on origin and timing stops, PDE otherwise).
- Show unsigned events when a vehicle is selected. Unsigned events require an authenticated user that is authorized to view the events on a per-vehicle basis.
- Show unsigned events in area search.
- Improve area search
- Other fixes and improvements.
