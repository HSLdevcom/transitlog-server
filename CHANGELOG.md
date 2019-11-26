# Transitlog server changelog

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
