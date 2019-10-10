import moment from 'moment-timezone'
import { TZ } from '../constants'
import { getNormalTime, isNextDay } from '../utils/time'
import { Direction } from '../types/generated/schema-types'
import Knex from 'knex'
import SQLDataSource from '../utils/SQLDataSource'
import { DBAlert, DBCancellation, Vehicles } from '../types/EventsDb'
import { databases, getKnex } from '../knex'
import { isBefore } from 'date-fns'

const knex: Knex = getKnex(databases.HFP)

// Data from before this date doesn't necessarily have other events than VP.
const EVENTS_CUTOFF_DATE = '2019-09-18'

const vehicleFields = [
  'journey_type',
  'event_type',
  'mode',
  'owner_operator_id',
  'vehicle_number',
  'unique_vehicle_id',
  'route_id',
  'direction_id',
  'headsign',
  'journey_start_time',
  'stop',
  'next_stop_id',
  'geohash_level',
  'desi',
  'tst',
  'tsi',
  'spd',
  'hdg',
  'lat',
  'long',
  'dl',
  'drst',
  'oday',
]

const unsignedEventFields = [
  'journey_type',
  'event_type',
  'unique_vehicle_id',
  'tst',
  'tsi',
  'drst',
  'spd',
  'hdg',
  'lat',
  'long',
  'owner_operator_id',
  'vehicle_number',
  'mode',
]

const routeDepartureFields = [
  'journey_type',
  'event_type',
  'unique_vehicle_id',
  'route_id',
  'direction_id',
  'journey_start_time',
  'stop',
  'next_stop_id',
  'tst',
  'tsi',
  'oday',
]

const routeJourneyFields = [
  'journey_type',
  'geohash_level',
  'route_id',
  'direction_id',
  'oday',
  'tst',
  'tsi',
  'journey_start_time',
  'owner_operator_id',
  'vehicle_number',
  'lat',
  'long',
  'drst',
  'hdg',
  'mode',
]

const cancellationFields = [
  'id',
  'created_at',
  'modified_at',
  'status',
  'start_date',
  'route_id',
  'direction_id',
  'start_time',
  'last_modified',
  'data',
]

const alertFields = [
  'id',
  'created_at',
  'modified_at',
  'route_id',
  'stop_id',
  'affects_all_routes',
  'affects_all_stops',
  'valid_from',
  'valid_to',
  'last_modified',
  'data',
  'ext_id_bulletin',
]

export class HFPDataSource extends SQLDataSource {
  constructor() {
    super({ log: false, name: 'hfp' })
    // Add your instance of Knex to the DataSource
    this.knex = knex
  }

  /*
   * Query for which vehicles were in traffic (ie have events) for a specific day.
   */

  async getAvailableVehicles(date): Promise<Vehicles[]> {
    const query = this.db.raw(
      `
SELECT DISTINCT ON (unique_vehicle_id) unique_vehicle_id,
vehicle_number,
owner_operator_id
FROM vehicle_continuous_aggregate
WHERE oday = :date;
`,
      { date }
    )

    return this.getBatched(query)
  }

  /*
   * Query for all vehicle events inside a specific area and timeframe.
   *
   * Index:
   * CREATE INDEX vehicle_journeys_idx ON vehicles (tst ASC, oday, unique_vehicle_id);
   */

  async getAreaJourneys(
    minTime,
    maxTime,
    bbox,
    date,
    unsignedEvents: boolean = false
  ): Promise<Vehicles[]> {
    const { minLat, maxLat, minLng, maxLng } = bbox

    const query = this.db.raw(
      `
SELECT ${vehicleFields.join(',')}
FROM vehicles
WHERE event_type = 'VP'
  ${!unsignedEvents ? `AND journey_type = 'journey'` : ''}
  AND tst BETWEEN :minTime AND :maxTime
  AND lat BETWEEN :minLat AND :maxLat
  AND long BETWEEN :minLng AND :maxLng
ORDER BY tst ASC;
    `,
      {
        date,
        minTime: moment.tz(minTime, TZ).toISOString(true),
        maxTime: moment.tz(maxTime, TZ).toISOString(true),
        minLat,
        maxLat,
        minLng,
        maxLng,
      }
    )

    return this.getBatched(query)
  }

  /*
   * Get the journeys for a vehicle. Only journey start time required. Shown in the sidebar
   * list of vehicle journeys when a vehicle is selected.
   *
   * Index:
   * CREATE INDEX vehicle_journeys_idx ON vehicles (tst ASC, oday, unique_vehicle_id);
   */

  async getJourneysForVehicle(uniqueVehicleId, date): Promise<Vehicles[]> {
    const [operatorPart, vehiclePart] = uniqueVehicleId.split('/')
    const operatorId = parseInt(operatorPart, 10)
    const vehicleId = parseInt(vehiclePart, 10)

    const queryVehicleId = `${operatorId}/${vehicleId}`

    const eventsQuery = this.db.raw(
      `SELECT DISTINCT ON (journey_start_time) ${vehicleFields.join(',')}
FROM vehicles
WHERE event_type = 'DEP'
  AND journey_type = 'journey'
  AND oday = ?
  AND unique_vehicle_id = ?
ORDER BY journey_start_time, tst;
`,
      [date, queryVehicleId]
    )

    const legacyQuery = this.db('vehicles')
      .select(vehicleFields)
      .where('event_type', 'VP')
      .where('oday', date)
      .where('unique_vehicle_id', queryVehicleId)
      .orderBy('tst', 'ASC')

    if (isBefore(date, EVENTS_CUTOFF_DATE)) {
      return this.getBatched(legacyQuery)
    }

    const eventsResult = await this.getBatched(eventsQuery)

    if (eventsResult.length === 0) {
      return this.getBatched(legacyQuery)
    }

    return eventsResult
  }

  /*
   * Get all events for a route. Drawn on map after route selection but before
   * departure selection.
   */

  async getRouteJourneys(routeId, direction, date): Promise<Vehicles[]> {
    // Disable temporarily
    return []

    const query = this.db('vehicles')
      .select(routeJourneyFields)
      .where('event_type', 'VP')
      .where('journey_type', 'journey')
      .where('oday', date)
      .where('route_id', routeId)
      .where('direction_id', direction)

    return this.getBatched(query)
  }

  /*
   * Get all the events for a specific journey.
   *
   * Index:
   * CREATE INDEX single_journey_events_idx ON vehicles (tst ASC, oday, route_id, direction_id, journey_start_time, unique_vehicle_id);
   */

  async getJourneyEvents(
    routeId,
    direction,
    departureDate,
    departureTime,
    uniqueVehicleId = ''
  ): Promise<Vehicles[]> {
    let operatorId
    let vehicleId

    if (uniqueVehicleId) {
      const [operatorPart, vehiclePart] = uniqueVehicleId.split('/')
      operatorId = parseInt(operatorPart, 10)
      vehicleId = parseInt(vehiclePart, 10)
    }

    let query = this.db('vehicles')
      .select(vehicleFields)
      .where('oday', departureDate)
      .where('route_id', routeId)
      .where('direction_id', direction)
      .where('journey_start_time', getNormalTime(departureTime))
      .orderBy('tst', 'ASC')

    if (uniqueVehicleId) {
      query = query.where('unique_vehicle_id', `${operatorId}/${vehicleId}`)
    }

    // Ensure the correct events are returned by limiting the results to timestamps
    // after the departure date if we are dealing with a 24h+ journey.
    if (isNextDay(departureTime)) {
      // Note that tst is UTC time so we should not give it a time with a timezone.
      query = query.where(
        'tst',
        '>',
        moment
          .tz(departureDate, TZ)
          .endOf('day')
          .toISOString()
      )
    }

    let vehicles: Vehicles[] = await this.getBatched(query)

    if (!uniqueVehicleId && vehicles.length !== 0) {
      const firstVehicleId = vehicles[0].unique_vehicle_id
      vehicles = vehicles.filter((event) => event.unique_vehicle_id === firstVehicleId)
    }

    return vehicles
  }

  /*
   * Get all departures for a specific stop during a date.
   */
  async getDepartureEvents(stopId: string, date: string): Promise<Vehicles[]> {
    const legacyQuery = this.db('vehicles')
      .select(
        this.db.raw(
          `DISTINCT ON ("journey_start_time", "unique_vehicle_id") ${vehicleFields.join(',')}`
        )
      )
      .where('event_type', 'VP')
      .where('oday', date)
      .where('stop', stopId)
      .orderBy([
        { column: 'journey_start_time', order: 'asc' },
        { column: 'unique_vehicle_id', order: 'asc' },
        { column: 'tst', order: 'desc' },
      ])

    const eventsQuery = this.db.raw(
      `
SELECT ${routeDepartureFields.join(',')}
FROM vehicles
WHERE event_type IN ('DEP', 'PDE')
  AND oday = ?
  AND stop = ?;
`,
      [date, stopId]
    )

    if (isBefore(date, EVENTS_CUTOFF_DATE)) {
      return this.getBatched(legacyQuery)
    }

    const eventsResult = await this.getBatched(eventsQuery)

    if (eventsResult.length === 0) {
      return this.getBatched(legacyQuery)
    }

    return eventsResult
  }

  /*
   * Get all departures for a specific route (from the origin stop) during a date.
   */

  async getRouteDepartureEvents(
    stopId: string,
    date: string,
    routeId: string,
    direction: Direction,
    lastStopArrival: boolean = false
  ): Promise<Vehicles[]> {
    const legacyQuery = this.db('vehicles')
      .select(
        this.db.raw(
          `DISTINCT ON ("journey_start_time", "unique_vehicle_id") ${routeDepartureFields.join(
            ','
          )}`
        )
      )
      .where('event_type', 'VP')
      .where('oday', date)
      .where('route_id', routeId)
      .where('direction_id', direction)
      .where('stop', stopId)
      .orderBy([
        { column: 'journey_start_time', order: 'asc' },
        { column: 'unique_vehicle_id', order: 'asc' },
        { column: 'tst', order: 'desc' },
      ])

    const eventsQuery = this.db.raw(
      `SELECT ${routeDepartureFields.join(',')}
FROM vehicles
WHERE event_type = :event
  AND oday = :date
  AND stop = :stopId
  AND route_id = :routeId
  AND direction_id = :direction;
`,
      { event: !lastStopArrival ? 'DEP' : 'ARS', date, stopId, routeId, direction }
    )

    // Legacy query does not support lastStopArrival
    if (!lastStopArrival && isBefore(date, EVENTS_CUTOFF_DATE)) {
      return this.getBatched(legacyQuery)
    }

    const eventsResult = await this.getBatched(eventsQuery)

    if (!lastStopArrival && eventsResult.length === 0) {
      return this.getBatched(legacyQuery)
    }

    return eventsResult
  }

  getUnsignedEventsForVehicle = async (
    date: string,
    uniqueVehicleId: string
  ): Promise<Vehicles[]> => {
    const minDate = moment
      .tz(date, TZ)
      .startOf('day')
      .utc()
      .format('YYYY-MM-DD HH:mm:ss.SSSSSS')

    const maxDate = moment
      .tz(date, TZ)
      .endOf('day')
      .add(4.5, 'hours')
      .utc()
      .format('YYYY-MM-DD HH:mm:ss.SSSSSS')

    const [operatorPart, vehiclePart] = uniqueVehicleId.split('/')
    const operatorId = parseInt(operatorPart, 10)
    const vehicleId = parseInt(vehiclePart, 10)

    const query = this.db.raw(
      `
      SELECT ${unsignedEventFields.join(',')}
      FROM vehicles
      WHERE tst >= :minDate AND tst < :maxDate
        AND journey_type = 'deadrun'
        AND unique_vehicle_id = :vehicleId
      ORDER BY unique_vehicle_id, tst;
    `,
      { vehicleId: `${operatorId}/${vehicleId}`, minDate, maxDate }
    )

    return this.getBatched(query)
  }

  getAlerts = async (minDate: string, maxDate: string): Promise<DBAlert[]> => {
    const query = this.db('alert')
      .select(
        this.db.raw(
          `DISTINCT ON ("valid_from", "valid_to", "stop_id", "route_id") ${alertFields.join(
            ','
          )}`
        )
      )
      .where((builder) =>
        builder.where('valid_from', '<=', minDate).andWhere('valid_to', '>=', minDate)
      )
      .orWhere((builder) =>
        builder.where('valid_from', '<=', maxDate).andWhere('valid_to', '>=', maxDate)
      )
      .orderBy([
        { column: 'valid_from', order: 'asc' },
        { column: 'valid_to', order: 'desc' },
        { column: 'stop_id', order: 'asc' },
        { column: 'route_id', order: 'asc' },
        { column: 'last_modified', order: 'desc' },
      ])

    return this.getBatched(query)
  }

  getCancellations = async (date: string): Promise<DBCancellation[]> => {
    const query = this.db('cancellation')
      .select(cancellationFields)
      .where('start_date', date)
      .orderBy([
        { column: 'last_modified', order: 'desc' },
        { column: 'start_time', order: 'asc' },
      ])

    return this.getBatched(query)
  }
}
