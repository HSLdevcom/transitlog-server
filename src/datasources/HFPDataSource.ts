import moment from 'moment-timezone'
import { DEBUG, TZ } from '../constants'
import { isNextDay } from '../utils/time'
import { Direction } from '../types/generated/schema-types'
import Knex from 'knex'
import SQLDataSource from '../utils/SQLDataSource'
import { DBAlert, DBCancellation, Vehicles } from '../types/EventsDb'
import { databases, getKnex } from '../knex'

const knex: Knex = getKnex(databases.HFP)

const vehicleFields = [
  'mode',
  'owner_operator_id',
  'vehicle_number',
  'unique_vehicle_id',
  'route_id',
  'direction_id',
  'headsign',
  'journey_start_time',
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

const routeDepartureFields = [
  'unique_vehicle_id',
  'route_id',
  'direction_id',
  'journey_start_time',
  'next_stop_id',
  'tst',
  'tsi',
  'oday',
]

const routeJourneyFields = [
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
   *
   * Optimization:
   * Materialized continuous view
   */

  async getAvailableVehicles(date): Promise<Vehicles[]> {
    const query = this.db.raw(
      `
SELECT distinct on (unique_vehicle_id) unique_vehicle_id,
vehicle_number,
owner_operator_id
FROM vehicle_continuous_aggregate
WHERE oday = :date
ORDER BY unique_vehicle_id;
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

  async getAreaJourneys(minTime, maxTime, bbox, date): Promise<Vehicles[]> {
    const { minLat, maxLat, minLng, maxLng } = bbox

    const query = this.db.raw(
      `
SELECT ${vehicleFields.join(',')}
FROM vehicles
WHERE oday = :date
  -- AND geohash_level <= 4 -- Limit the amount of data coming into the app
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

    const query = this.db('vehicles')
      .select(vehicleFields)
      .where('oday', date)
      .where('unique_vehicle_id', queryVehicleId)
      .orderBy('tst', 'ASC')

    return this.getBatched(query)
  }

  /*
   * Get all events for a route. Drawn on map after route selection but before
   * departure selection.
   */

  async getRouteJourneys(routeId, direction, date): Promise<Vehicles[]> {
    // Disable until we can optimize this query.
    return []

    const query = this.db('vehicles')
      .select(routeJourneyFields)
      .where('oday', date)
      .where('route_id', routeId)
      .where('direction_id', direction)
      .orderBy('tst', 'ASC')

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
      .where('journey_start_time', departureTime)
      .orderBy('tst', 'ASC')

    // TODO: Test without uniqueVehicleId
    if (uniqueVehicleId) {
      query = query.where('unique_vehicle_id', `${operatorId}/${vehicleId}`)
    }

    // TODO: Test next day departures
    if (isNextDay(departureTime)) {
      query = query.where('tst', '>', moment.tz(departureDate, TZ).toISOString(true))
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
   *
   * Index:
   * CREATE INDEX stop_departures_idx ON vehicles (tst DESC, unique_vehicle_id ASC, journey_start_time ASC, oday, next_stop_id);
   */

  async getDepartureEvents(stopId: string, date: string): Promise<Vehicles[]> {
    const query = this.db('vehicles')
      .select(
        this.db.raw(
          `DISTINCT ON ("journey_start_time", "unique_vehicle_id") ${vehicleFields.join(',')}`
        )
      )
      .where('oday', date)
      .where('next_stop_id', stopId)
      .orderBy([
        { column: 'journey_start_time', order: 'asc' },
        { column: 'unique_vehicle_id', order: 'asc' },
        { column: 'tst', order: 'desc' },
      ])

    return this.getBatched(query)
  }

  /*
   * Get all departures for a specific route (from the origin stop) during a date.
   *
   * Index:
   * CREATE INDEX route_departures_idx ON vehicles (tst DESC, unique_vehicle_id ASC, journey_start_time ASC, oday ASC, next_stop_id, route_id, direction_id);
   */

  async getRouteDepartureEvents(
    stopId: string,
    date: string,
    routeId: string,
    direction: Direction
  ): Promise<Vehicles[]> {
    const query = this.db('vehicles')
      .select(
        this.db.raw(
          `DISTINCT ON ("journey_start_time", "unique_vehicle_id") ${routeDepartureFields.join(
            ','
          )}`
        )
      )
      .where('oday', date)
      .where('next_stop_id', stopId)
      .where('route_id', routeId)
      .where('direction_id', direction)
      .orderBy([
        { column: 'journey_start_time', order: 'asc' },
        { column: 'unique_vehicle_id', order: 'asc' },
        { column: 'tst', order: 'desc' },
      ])

    return this.getBatched(query)
  }

  /*
   * Get weekly departures for a specific route (from the origin stop).
   *
   * Index (same as above):
   * CREATE INDEX route_departures_idx ON vehicles (tst DESC, unique_vehicle_id ASC, journey_start_time ASC, oday ASC, next_stop_id, route_id, direction_id);
   */

  async getWeeklyDepartureEvents(
    stopId: string,
    date: string,
    routeId: string,
    direction: Direction
  ): Promise<Vehicles[]> {
    const minDateMoment = moment.tz(date, TZ).startOf('isoWeek')
    const maxDateMoment = minDateMoment.clone().endOf('isoWeek')

    const query = this.db('vehicles')
      .select(
        this.db.raw(
          `DISTINCT ON ("oday", "journey_start_time", "route_id", "direction_id", "unique_vehicle_id") ${routeDepartureFields.join(
            ','
          )}`
        )
      )
      .whereBetween('oday', [
        minDateMoment.format('YYYY-MM-DD'),
        maxDateMoment.format('YYYY-MM-DD'),
      ])
      .where('next_stop_id', stopId)
      .where('route_id', routeId)
      .where('direction_id', direction)
      .orderBy([
        { column: 'oday', order: 'asc' },
        { column: 'journey_start_time', order: 'asc' },
        { column: 'route_id', order: 'asc' },
        { column: 'direction_id', order: 'asc' },
        { column: 'unique_vehicle_id', order: 'asc' },
        { column: 'tst', order: 'desc' },
      ])

    return this.getBatched(query)
  }

  getAlerts = async (minDate: string, maxDate: string): Promise<DBAlert[]> => {
    const query = this.db('alert')
      .select(
        this.db.raw(
          `DISTINCT ON ("valid_from", "valid_to", "stop_id", "route_id") ${alertFields.join(',')}`
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
      .orderBy([{ column: 'last_modified', order: 'desc' }, { column: 'start_time', order: 'asc' }])

    return this.getBatched(query)
  }
}
