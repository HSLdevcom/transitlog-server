import moment from 'moment-timezone'
import { TZ } from '../constants'
import { getDateFromDateTime, getNormalTime } from '../utils/time'
import { Scalars } from '../types/generated/schema-types'
import Knex from 'knex'
import SQLDataSource from '../utils/SQLDataSource'
import { DBAlert, DBCancellation, JourneyEvents, Vehicles } from '../types/EventsDb'
import { databases, getKnex } from '../knex'
import { isBefore } from 'date-fns'
import { Moment } from 'moment'
import { createHfpVehicleId } from '../utils/createUniqueVehicleId'
import { orderBy } from 'lodash'

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
  'event_type',
  'route_id',
  'direction_id',
  'oday',
  'tst',
  'tsi',
  'journey_start_time',
  'unique_vehicle_id',
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

type TstRange = {
  minTime: string
  maxTime: string
  minTimeMoment: Moment
  maxTimeMoment: Moment
}

const TST_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSSSSS ZZ'

function createTstRange(date: string): TstRange {
  const minTimeMoment = moment(date)
    .tz(TZ)
    .startOf('day')
    .add(4, 'hours')
    .utc()

  const minTime = minTimeMoment.format(TST_FORMAT)

  const maxTimeMoment = moment(date)
    .tz(TZ)
    .endOf('day')
    .add(5, 'hours')
    .utc()

  const maxTime = maxTimeMoment.format(TST_FORMAT)

  return { minTime, maxTime, minTimeMoment, maxTimeMoment }
}

export class HFPDataSource extends SQLDataSource {
  constructor() {
    super({ log: true, name: 'hfp' })
    // Add your instance of Knex to the DataSource
    this.knex = knex
  }

  /*
   * Query for which vehicles were in traffic (ie have events) for a specific day.
   */

  async getAvailableVehicles(date): Promise<Vehicles[]> {
    const { minTime, maxTime } = createTstRange(date)

    const query = this.db.raw(
      `
SELECT DISTINCT ON (unique_vehicle_id) unique_vehicle_id,
vehicle_number,
owner_operator_id
FROM otherevent
WHERE tst >= :minTime
  AND tst < :maxTime
  AND event_type = 'VJA'
ORDER BY unique_vehicle_id, tst DESC;
`,
      { date, minTime, maxTime }
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

    const createQuery = (table) => {
      const query = this.db.raw(
        `
SELECT ${vehicleFields.join(',')}
FROM :table:
WHERE tst >= :minTime
  AND tst <= :maxTime
  AND lat >= :minLat
  AND lat < :maxLat
  AND long >= :minLng
  AND long < :maxLng
  AND is_ongoing = true
ORDER BY tst DESC;
    `,
        {
          table,
          date,
          minTime: moment.tz(minTime, TZ).toISOString(true),
          maxTime: moment.tz(maxTime, TZ).toISOString(true),
          minLat,
          maxLat,
          minLng,
          maxLng,
        }
      )

      return query
    }

    const queries = [this.getBatched(createQuery('vehicleposition'))]

    if (unsignedEvents) {
      queries.push(this.getBatched(createQuery('unsignedevent')))
    }

    return Promise.all(queries).then(([vp, unsigned]) =>
      orderBy([...vp, ...unsigned], 'tsi', 'asc')
    )
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
    const { minTime, maxTime } = createTstRange(date)

    const eventsQuery = this.db.raw(
      `SELECT ${vehicleFields.join(',')}
FROM stopevent
WHERE tst >= :minTime
  AND tst <= :maxTime
  AND event_type = 'DEP'
  AND oday = :date
  AND unique_vehicle_id = :vehicleId
  AND is_ongoing = true
ORDER BY tst ASC;
`,
      { date, minTime, maxTime, vehicleId: queryVehicleId }
    )

    const legacyQuery = this.db('vehicleposition')
      .select(vehicleFields)
      .whereBetween('tst', [minTime, maxTime])
      .where('journey_type', 'journey')
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
    const { minTime, maxTime } = createTstRange(date)

    const query = this.db.raw(
      `SELECT ${routeJourneyFields.join(',')}
      FROM vehicleposition
      WHERE tst >= :minTime
        AND tst <= :maxTime
        AND route_id = :routeId
        AND direction_id = :direction
      ORDER BY tst DESC;
    `,
      { date, minTime, maxTime, routeId, direction }
    )

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
  ): Promise<JourneyEvents> {
    let operatorId
    let vehicleId

    if (uniqueVehicleId) {
      const [operatorPart, vehiclePart] = uniqueVehicleId.split('/')
      operatorId = parseInt(operatorPart, 10)
      vehicleId = parseInt(vehiclePart, 10)
    }

    const { minTime, maxTime, minTimeMoment, maxTimeMoment } = createTstRange(departureDate)
    const journeyStartMoment: Moment = getDateFromDateTime(departureDate, departureTime)

    let useMinTime = minTime
    let useMaxTime = maxTime

    // Ensure the query time range fits the journey by moditying the start or end if needed.

    if (journeyStartMoment.isBefore(minTimeMoment)) {
      useMinTime = journeyStartMoment
        .clone()
        .subtract(1, 'hour')
        .format(TST_FORMAT)
    }

    if (
      journeyStartMoment
        .clone()
        .add(2, 'hours')
        .isAfter(maxTimeMoment)
    ) {
      useMaxTime = journeyStartMoment
        .clone()
        .add(3, 'hours')
        .format(TST_FORMAT)
    }

    const queryVehicleId = `${operatorId}/${vehicleId}`

    const createQuery = (table) => {
      let query = this.db(table)
        .select(vehicleFields)
        .whereBetween('tst', [useMinTime, useMaxTime])
        .where('journey_start_time', getNormalTime(departureTime))
        .where('route_id', routeId)
        .where('direction_id', direction)
        .where('oday', departureDate)

      if (uniqueVehicleId) {
        query = query.where('unique_vehicle_id', queryVehicleId)
      }

      return query
    }

    const queries = [
      createQuery('vehicleposition'),
      createQuery('stopevent'),
      createQuery('otherevent'),
      createQuery('lightpriorityevent'),
    ]

    return Promise.all(queries).then(
      (results: Vehicles[][]): JourneyEvents => {
        let vehicleResults: Vehicles[][] = results

        // If no uniqueVehicleId was provided, get the vehicle ID from the first
        // event result and filter all events according to it.
        if (!uniqueVehicleId && vehicleResults[0].length !== 0) {
          const firstVehicleId = vehicleResults[0][0].unique_vehicle_id

          vehicleResults = vehicleResults.reduce(
            (filteredResults: Vehicles[][], eventsArr: Vehicles[]) => {
              const filteredEvents = eventsArr.filter(
                (event) => event.unique_vehicle_id === firstVehicleId
              )
              filteredResults.push(filteredEvents)
              return filteredResults
            },
            []
          )
        }

        const [vehiclePositions, stopEvents, otherEvents, lightPriorityEvents] = vehicleResults

        const ensureArray = (val) =>
          !!val && Array.isArray(val) && val.length !== 0 ? val : []

        return {
          vehiclePositions: ensureArray(vehiclePositions),
          stopEvents: ensureArray(stopEvents),
          otherEvents: [...ensureArray(otherEvents), ...ensureArray(lightPriorityEvents)],
        }
      }
    )
  }

  /*
   * Get all departures for a specific stop during a date.
   */
  async getDepartureEvents(stopId: string, date: string): Promise<Vehicles[]> {
    const { minTime, maxTime } = createTstRange(date)

    const legacyQuery = this.db('vehicleposition')
      .select(
        this.db.raw(
          `DISTINCT ON ("journey_start_time", "unique_vehicle_id") ${vehicleFields.join(',')}`
        )
      )
      .whereBetween('tst', [minTime, maxTime])
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
FROM stopevent
WHERE tst >= :minTime
  AND tst < :maxTime
  AND event_type IN ('DEP', 'PDE', 'PAS')
  AND oday = :date
  AND stop = :stopId
  AND is_ongoing = true
ORDER BY tst DESC;
`,
      { date, stopId, minTime, maxTime }
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
    direction: Scalars['Direction'],
    lastStopArrival: boolean = false
  ): Promise<Vehicles[]> {
    const { minTime, maxTime } = createTstRange(date)

    const legacyQuery = this.db('vehicleposition')
      .select(
        this.db.raw(
          `DISTINCT ON ("journey_start_time", "unique_vehicle_id") ${routeDepartureFields.join(
            ','
          )}`
        )
      )
      .whereBetween('tst', [minTime, maxTime])
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

    // Legacy query does not support lastStopArrival
    if (!lastStopArrival && isBefore(date, EVENTS_CUTOFF_DATE)) {
      return this.getBatched(legacyQuery)
    }

    const queryEventTypes = !lastStopArrival ? ['DEP', 'PDE'] : ['ARS', 'ARR']

    const eventsQuery = this.db.raw(
      `SELECT ${routeDepartureFields.join(',')}
FROM stopevent
WHERE tst >= :minTime
  AND tst <= :maxTime
  AND event_type IN ('${queryEventTypes.join(`','`)}')
  AND stop = :stopId
  AND route_id = :routeId
  AND direction_id = :direction
  AND oday = :date
  AND is_ongoing = true
ORDER BY tst DESC;
`,
      {
        minTime,
        maxTime,
        date,
        stopId,
        routeId,
        direction,
      }
    )

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
    const { minTime, maxTime } = createTstRange(date)

    const query = this.db.raw(
      `
      SELECT ${unsignedEventFields.join(',')}
      FROM unsignedevent
      WHERE tst >= :minTime AND tst <= :maxTime
        AND unique_vehicle_id = :vehicleId
      ORDER BY tst DESC;
    `,
      { vehicleId: createHfpVehicleId(uniqueVehicleId), minTime, maxTime }
    )

    return this.getBatched(query)
  }

  getAlerts = async (date: string): Promise<DBAlert[]> => {
    const query = this.db('alert')
      .select(alertFields)
      .where('valid_from', '<=', date)
      .where('valid_to', '>=', date)
      .orderBy([
        { column: 'valid_from', order: 'asc' },
        { column: 'valid_to', order: 'asc' },
        { column: 'created_at', order: 'desc' },
        { column: 'modified_at', order: 'desc' },
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
