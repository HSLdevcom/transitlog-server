# Transitlog server changelog

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
