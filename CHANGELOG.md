# Transitlog server changelog

## Version 1.1.0, deployed 2019-01-03 @ 06:00

- Improve departures events query and GraphQL response.
- Fix metro stop event door status.
- Use the correct event type for various departure cases (DEP on origin and timing stops, PDE otherwise).
- Show unsigned events when a vehicle is selected. Unsigned events require an authenticated user that is authorized to view the events on a per-vehicle basis.
- Show unsigned events in area search.
- Improve area search
- Other fixes and improvements.
