import {
  JoreDeparture,
  JoreDepartureWithOrigin,
  JoreEquipment,
  JoreExceptionDay,
  JoreRoute,
  JoreRouteData,
  JoreRouteDepartureData,
  JoreRouteGeometry,
  JoreStop,
  JoreStopSegment,
  JoreTerminal,
} from '../types/Jore'
import { ExceptionDay, Scalars } from '../types/generated/schema-types'
import { dayTypes, getDayTypeFromDate } from '../utils/dayTypes'
import { compact, flatten, orderBy, uniq } from 'lodash'
import SQLDataSource from '../utils/SQLDataSource'
import { PlannedJourneyData } from '../creators/createJourneyResponse'
import { endOfYear, format, getYear, isEqual, isSameYear, startOfYear } from 'date-fns'
import { cacheFetch } from '../cache'
import { CachedFetcher } from '../types/CachedFetcher'
import { createExceptionDayObject } from '../objects/createExceptionDayObject'
import { databases, getKnex } from '../knex'

const knex = getKnex(databases.JORE)

type ExceptionDaysScoped = {
  normal: string[]
  [scope: string]: string[]
}

let routeModeQuery = () => `
    SELECT DISTINCT ON (route.reitunnus)
       route.reitunnus,
       case
           when line is null then 'BUS'
           else
               case line.linjoukkollaji
                   when '02' then 'TRAM'
                   when '06' then 'SUBWAY'
                   when '07' then 'FERRY'
                   when '12' then 'RAIL'
                   when '13' then 'RAIL'
                   else 'BUS' end
           end as mode
    FROM jore.jr_reitti route
             LEFT JOIN jore.jr_linja line USING (lintunnus)
    ORDER BY route.reitunnus
`

let stopModeQuery = () => `
    SELECT DISTINCT ON (link.reitunnus, link.lnkalkusolmu)
      link.reitunnus,
      link.lnkalkusolmu,
      case
        when line is null then 'BUS'
        else
           case line.linjoukkollaji
               when '02' then 'TRAM'
               when '06' then 'SUBWAY'
               when '07' then 'FERRY'
               when '12' then 'RAIL'
               when '13' then 'RAIL'
               else 'BUS' end
        end as mode
    FROM jore.jr_reitinlinkki link
             LEFT JOIN jore.jr_reitti route USING (reitunnus)
             LEFT JOIN jore.jr_linja line USING (lintunnus)
    WHERE link.relpysakki = 'P'
    ORDER BY link.reitunnus, link.lnkalkusolmu
`

let routeQuery = (routeId?: string, direction?: number) => {
  let where =
    routeId && direction
      ? `dir.reitunnus = :routeId
  AND dir.suusuunta = :direction
  AND `
      : ''

  return ` 
    SELECT DISTINCT ON (dir.reitunnus, dir.suusuunta, dir.suuvoimast, dir.suuvoimviimpvm)
        dir.reitunnus route_id,
        dir.suusuunta direction,
        dir.suulahpaik origin_fi,
        origin_link.lnkalkusolmu originstop_id,
        dir.suupaapaik destination_fi,
        dest_link.lnkloppusolmu destinationstop_id,
        route.reinimi name_fi,
        route.reinimi route_name,
        dir.suuvoimast date_begin,
        dir.suuvoimviimpvm date_end,
        dir.suuviimpvm date_modified,
        dir.suupituus route_length,
        route_mode.mode
    FROM jore.jr_reitinsuunta dir
      LEFT JOIN jore.jr_reitti route USING (reitunnus)
      LEFT JOIN route_mode USING (reitunnus)
      LEFT JOIN LATERAL (
         SELECT DISTINCT ON (inner_link.reitunnus, inner_link.suusuunta, inner_link.suuvoimast) lnkalkusolmu
         FROM jore.jr_reitinlinkki inner_link
         WHERE inner_link.relpysakki != 'E'
           AND dir.reitunnus = reitunnus
           AND dir.suusuunta = suusuunta
           AND dir.suuvoimast = suuvoimast
         ORDER BY inner_link.reitunnus, inner_link.suusuunta, inner_link.suuvoimast, inner_link.reljarjnro ASC
         LIMIT 1
      ) origin_link ON true
      LEFT JOIN LATERAL (
         SELECT DISTINCT ON (inner_link.reitunnus, inner_link.suusuunta, inner_link.suuvoimast) lnkloppusolmu
         FROM jore.jr_reitinlinkki inner_link
         WHERE inner_link.relpysakki != 'E'
           AND dir.reitunnus = reitunnus
           AND dir.suusuunta = suusuunta
           AND dir.suuvoimast = suuvoimast
         ORDER BY inner_link.reitunnus, inner_link.suusuunta, inner_link.suuvoimast, inner_link.reljarjnro DESC
         LIMIT 1
      ) dest_link ON true
    WHERE ${where} origin_link.lnkalkusolmu IS NOT NULL
     AND dest_link.lnkloppusolmu IS NOT NULL
    ORDER BY dir.reitunnus, dir.suusuunta, dir.suuvoimast, dir.suuvoimviimpvm
  `
}

const equipmentQuery = (vehicleId?: string, operatorId?: string) => {
  let where =
    vehicleId && operatorId
      ? `WHERE vehicle_id = '${vehicleId}' AND operator_id = '${operatorId}'`
      : ''

  return `
      WITH vehicles AS (
          SELECT 'B'::char                                 vehicle_class,
                 veh.reknro                                registry_nr,
                 veh.kylkinro                              vehicle_id,
                 date_part('year', AGE(now(), veh.rekpvm)) age,
                 veh.kaltyyppi          as                 type,
                 veh.turvateli::boolean                    multi_axle,
                 COALESCE((
                              SELECT ilme.kooselite
                              FROM jore.jr_koodisto ilme
                              WHERE veh.ulkoilme::numeric = ilme.kookoodi::numeric
                                AND ilme.koolista = 'Ulkoilme'
                              LIMIT 1
                          ), 'unknown') as                 exterior_color,
                 veh.liitunnus                             operator_id,
                 veh.paastoluokka                          emission_class,
                 COALESCE((
                              SELECT paasto.kooselite
                              FROM jore.jr_koodisto paasto
                              WHERE veh.paastoluokka::numeric = paasto.kookoodi::numeric
                                AND paasto.koolista = 'Päästöluokka'
                          ), 'Tyhjä')                      emission_desc
          FROM jore.jr_ajoneuvo veh
      ),
           rail AS (
               SELECT rai.tyyppi                                 vehicle_class,
                      rai.reknro                                 registry_nr,
                      rai.kylkinro                               vehicle_id,
                      date_part('year', AGE(now(), rai.alkupvm)) age,
                      rai.kaltyyppi as                           type,
                      FALSE                                      multi_axle,
                      NULL                                       exterior_color,
                      rai.liitunnus                              operator_id,
                      11                                         emission_class,
                      NULL                                       emission_desc
               FROM jore.jr_raidekalusto rai
           )
      SELECT *
      FROM (
             (
                 SELECT vehicle_class,
                        registry_nr,
                        vehicle_id,
                        operator_id,
                        type,
                        age,
                        exterior_color,
                        multi_axle,
                        emission_class,
                        emission_desc
                 FROM vehicles
             )
             UNION ALL
             (
                 SELECT vehicle_class,
                        registry_nr,
                        vehicle_id,
                        operator_id,
                        type,
                        age,
                        exterior_color,
                        multi_axle,
                        emission_class,
                        emission_desc
                 FROM rail
             )
      ) veh ${where};
  `
}

export class JoreDataSource extends SQLDataSource {
  constructor() {
    super({ log: false, name: 'jore' })
    // Add your instance of Knex to the DataSource
    this.knex = knex
  }

  async getRoutes(): Promise<JoreRoute[]> {
    const query = this.db.raw(`
      WITH route_mode AS (${routeModeQuery()})
      ${routeQuery()};
    `)
    return this.getBatched(query)
  }

  async getRoute(routeId: string, direction: number): Promise<JoreRoute[]> {
    const query = this.db.raw(
      `
      WITH route_mode AS (${routeModeQuery()})
      ${routeQuery(routeId, direction)};
    `,
      {
        routeId,
        direction,
      }
    )
    return this.getBatched(query)
  }

  async getRouteGeometry(
    routeId: string,
    direction: number,
    date: string
  ): Promise<JoreRouteGeometry[]> {
    // language=PostgreSQL
    const query = this.db.raw(
      `
      WITH route_mode AS (${routeModeQuery()})
      SELECT geometry.route_id,
        geometry.direction,
        geometry.date_begin,
        ST_AsGeoJSON(st_flipcoordinates(ST_Transform(geometry.geom, 4326)))::JSONB geometry,
        route_mode.mode  
      FROM jore.route_geometry geometry
           LEFT JOIN route_mode ON geometry.route_id = route_mode.reitunnus
       WHERE geometry.route_id = :routeId
         AND geometry.direction = :direction
         AND geometry.date_begin <= :date;`,
      { routeId, direction, date }
    )

    return this.getBatched(query)
  }

  async getStopSegments(stopId: string, date: string): Promise<JoreRouteData[]> {
    // language=PostgreSQL
    const query = this.db.raw(
      `
        WITH route_mode AS (${routeModeQuery()}),
        route_query AS (${routeQuery()}),
        stop_link AS (
     SELECT DISTINCT ON (route.route_id, route.direction, route.date_begin, route.date_end, link.lnkalkusolmu)
        route.*,
        (row_number() OVER (
           PARTITION BY link.reitunnus, link.suusuunta, link.suuvoimast
           ORDER BY link.reljarjnro
        ))::integer stop_index,
        CASE WHEN link.ajantaspys IS NULL THEN FALSE
           ELSE CASE WHEN link.ajantaspys = 0 THEN FALSE
           ELSE TRUE END
        END timing_stop_type,
        CASE WHEN link.lnkloppusolmu = route.destinationstop_id THEN link.lnkloppusolmu
           ELSE link.lnkalkusolmu
        END stop_id
     FROM route_query route
          LEFT JOIN LATERAL (
             SELECT *
                 FROM jore.jr_reitinlinkki inner_link
                 WHERE inner_link.relpysakki != 'E'
                   AND route.route_id = inner_link.reitunnus
                   AND route.direction = inner_link.suusuunta
                   AND route.date_begin = inner_link.suuvoimast
         ) link ON TRUE
     ORDER BY route.route_id, route.direction, route.date_begin, route.date_end, link.lnkalkusolmu, link.reljarjnro, link.suuvoimast DESC
 )
        SELECT DISTINCT ON (stop.soltunnus, route.route_id, route.direction, route.date_begin, route.date_end)
          route.*,
          knot.solstmx lat,
          knot.solstmy lon,
          stop.soltunnus stop_id,
          ((knot.solkirjain || knot.sollistunnus)) short_id,
          stop.pysnimi name_fi,
          stop.pyssade stop_radius
          FROM jore.jr_pysakki stop
              INNER JOIN stop_link route ON stop.soltunnus = route.stop_id
              INNER JOIN jore.jr_solmu knot on route.stop_id = knot.soltunnus
          WHERE stop.soltunnus = :stopId
            AND :date BETWEEN route.date_begin AND route.date_end
            AND link.reitunnus IS NOT NULL
            AND knot.sollistunnus IS NULL
        ORDER BY stop.soltunnus, route.route_id, route.direction, route.date_begin, route.date_end, link.reljarjnro;
   `,
      { stopId, date }
    )

    return this.getBatched(query)
  }

  async getSimpleStop(stopId: string): Promise<JoreStop | null> {
    // language=PostgreSQL
    const query = this.db.raw(
      `
        WITH stop_mode AS (${stopModeQuery()})
        SELECT stop.soltunnus stop_id,
               (knot.solkirjain || knot.sollistunnus) short_id,
               knot.solstmx lat,
               knot.solstmy lon,
               stop.pysnimi name_fi,
               stop.pyssade stop_radius,
               (SELECT array_agg(DISTINCT mode) FROM stop_mode sm WHERE sm.lnkalkusolmu = stop.soltunnus) as modes
        FROM jore.jr_pysakki stop
             LEFT JOIN jore.jr_solmu knot USING (soltunnus)
        WHERE stop.soltunnus = :stopId;
      `,
      { stopId: (stopId || '') + '' }
    )

    const result = await this.getBatched(query)
    return result[0] || null
  }

  async getStops(): Promise<JoreStop[]>
  async getStops(date?: string): Promise<JoreRouteData[]> {
    // language=PostgreSQL
    const query = date
      ? this.db.raw(
          `
        WITH route_mode AS (${routeModeQuery()}),
        route_query AS (${routeQuery()}),
        stop_link AS (
     SELECT DISTINCT ON (route.route_id, route.direction, route.date_begin, route.date_end, link.lnkalkusolmu)
        route.*,
        (row_number() OVER (
           PARTITION BY link.reitunnus, link.suusuunta, link.suuvoimast
           ORDER BY link.reljarjnro
        ))::integer stop_index,
        CASE WHEN link.ajantaspys IS NULL THEN FALSE
           ELSE CASE WHEN link.ajantaspys = 0 THEN FALSE
           ELSE TRUE END
        END timing_stop_type,
        CASE WHEN link.lnkloppusolmu = route.destinationstop_id THEN link.lnkloppusolmu
           ELSE link.lnkalkusolmu
        END stop_id
     FROM route_query route
          LEFT JOIN LATERAL (
             SELECT *
                 FROM jore.jr_reitinlinkki inner_link
                 WHERE inner_link.relpysakki != 'E'
                   AND route.route_id = inner_link.reitunnus
                   AND route.direction = inner_link.suusuunta
                   AND route.date_begin = inner_link.suuvoimast
         ) link ON TRUE
     ORDER BY route.route_id, route.direction, route.date_begin, route.date_end, link.lnkalkusolmu, link.reljarjnro, link.suuvoimast DESC
 )
SELECT DISTINCT ON (stop.soltunnus, route.route_id, route.direction, route.date_begin, route.date_end)
    route.*,
    knot.solstmx lat,
    knot.solstmy lon,
    stop.soltunnus stop_id,
    ((knot.solkirjain || knot.sollistunnus)) short_id,
    stop.pysnimi name_fi,
    stop.pyssade stop_radius
    FROM jore.jr_pysakki stop
        INNER JOIN stop_link route ON stop.soltunnus = route.stop_id
        INNER JOIN jore.jr_solmu knot on route.stop_id = knot.soltunnus
    WHERE :date BETWEEN route.date_begin AND route.date_end
      -- fix this at some point
      AND knot.sollistunnus IS NOT NULL
    ORDER BY stop.soltunnus, route.route_id, route.direction, route.date_begin, route.date_end;`,
          { date }
        )
      : this.db.raw(
          `
          WITH stop_mode AS (${stopModeQuery()})
          SELECT stop.soltunnus stop_id,
                 (knot.solkirjain || knot.sollistunnus) short_id,
                 knot.solstmx lat,
                 knot.solstmy lon,
                 stop.pysnimi name_fi,
                 stop.pyssade stop_radius,
                 (SELECT array_agg(DISTINCT mode) FROM stop_mode sm WHERE sm.lnkalkusolmu = stop.soltunnus) as modes
          FROM jore.jr_pysakki stop
               LEFT JOIN jore.jr_solmu knot USING (soltunnus)
        `
        )

    let result = await this.getBatched(query)
    return result.filter((res) => !!res.stop_id)
  }

  async getTerminal(terminalId): Promise<JoreTerminal | null> {
    // language=PostgreSQL
    const query = this.db.raw(
      `
          WITH stop_mode AS (${stopModeQuery()})        
          SELECT terminal.termid terminal_id,
                 terminal.solomx lat,
                 terminal.solomy lon,
                 terminal.nimi name_fi,
                 terminal.nimir name_se,
                 terminal.tallpvm date_modified,
                 stop.soltunnus stop_id,
                 stop.terminaali as stop_terminal_id,
                 array_agg(DISTINCT mode) as modes
          FROM jore.jr_lij_terminaalialue terminal
               LEFT JOIN jore.jr_pysakki stop ON stop.terminaali = terminal.termid
               LEFT JOIN stop_mode sm ON sm.lnkalkusolmu = stop.soltunnus
          WHERE terminal.termid = :terminalId
          GROUP BY (terminal.termid, stop.soltunnus);`,
      { terminalId }
    )

    return this.getBatched(query)
  }

  async getTerminalStops(terminalId: string): Promise<string[]> {
    if (!terminalId) {
      return []
    }

    const query = this.db.raw(
      `SELECT stop.soltunnus stop_id
         FROM jore.jr_pysakki stop
         WHERE stop.terminaali = :terminalId;`,
      { terminalId }
    )

    const stopIds = await this.getBatched(query)

    if (!stopIds || stopIds.length === 0) {
      return []
    }

    return stopIds.map(({ stop_id }) => stop_id)
  }

  async getTerminals(): Promise<JoreTerminal[]> {
    // language=PostgreSQL
    const query = this.db.raw(
      `
          WITH stop_mode AS (${stopModeQuery()})        
          SELECT terminal.termid terminal_id,
                 terminal.solomx lat,
                 terminal.solomy lon,
                 terminal.nimi name_fi,
                 terminal.nimir name_se,
                 terminal.tallpvm date_modified,
                 stop.soltunnus stop_id,
                 stop.terminaali as stop_terminal_id,
                 array_agg(DISTINCT mode) as modes
          FROM jore.jr_lij_terminaalialue terminal
               LEFT JOIN jore.jr_pysakki stop ON stop.terminaali = terminal.termid
               LEFT JOIN stop_mode sm ON sm.lnkalkusolmu = stop.soltunnus
          GROUP BY (terminal.termid, stop.soltunnus);`
    )

    return this.getBatched(query)
  }

  async getEquipment(): Promise<JoreEquipment[]> {
    const query = this.db.raw(equipmentQuery())
    return this.getBatched(query)
  }

  async getEquipmentById(
    vehicleId: string | number,
    operatorId: string
  ): Promise<JoreEquipment[]> {
    const joreVehicleId = vehicleId + ''
    const joreOperatorId = (operatorId + '').padStart(4, '0')

    const query = this.db.raw(equipmentQuery(joreVehicleId, joreOperatorId))
    return this.getBatched(query)
  }

  async getRouteSegments(routeId: string, direction: number): Promise<JoreRouteData[]> {
    const query = this.db.raw(
      `
        WITH route_mode AS (${routeModeQuery()}),
        route_query AS (${routeQuery(routeId, direction)}),
        stop_link AS (
        SELECT DISTINCT ON (route.route_id, route.direction, route.date_begin, route.date_end, link.lnkalkusolmu)
            route.route_id,
            route.direction,
            route.date_begin,
            route.date_end,
            (row_number() OVER (
                PARTITION BY link.reitunnus, link.suusuunta, link.suuvoimast
                ORDER BY link.reljarjnro
                ))::integer stop_index,
            CASE WHEN link.ajantaspys IS NULL THEN false
                 ELSE CASE WHEN link.ajantaspys = 0 THEN false
                           ELSE true END
                END timing_stop_type,
            CASE WHEN link.lnkloppusolmu = route.destinationstop_id THEN link.lnkloppusolmu ELSE link.lnkalkusolmu END stop_id
            FROM route_query route
                LEFT JOIN LATERAL (
                SELECT *
                    FROM jore.jr_reitinlinkki inner_link
                    WHERE inner_link.relpysakki != 'E'
                      AND route.route_id = inner_link.reitunnus
                      AND route.direction = inner_link.suusuunta
                      AND route.date_begin = inner_link.suuvoimast
                ) link ON true
        ORDER BY route.route_id, route.direction, route.date_begin, route.date_end, link.lnkalkusolmu, link.reljarjnro, link.suuvoimast DESC
        )
        SELECT DISTINCT ON (route.route_id, route.direction, route.date_begin, route.date_end, link.stop_id)
            route.*,
            seg.pystunnus2 next_stop_id,
            knot.solstmx lat,
            knot.solstmy lon,
            stop.soltunnus stop_id,
            (knot.solkirjain || knot.sollistunnus) short_id,
            stop.pysnimi name_fi,
            stop.pyssade stop_radius,
            link.timing_stop_type,
            link.stop_index::integer stop_index,
            CASE WHEN link.stop_index::integer <> 1 THEN seg.pituus ELSE 0 END distance_from_previous,
            SUM(CASE WHEN link.stop_index::integer <> 1 THEN seg.pituus END) OVER (
                PARTITION BY route.route_id, route.direction, route.date_begin, route.date_end
                ORDER BY link.stop_index::integer
            ) distance_from_start
            FROM route_query route
                 INNER JOIN stop_link link USING (route_id, direction, date_begin, date_end)
                 INNER JOIN jore.jr_solmu knot ON link.stop_id = knot.soltunnus
                 INNER JOIN jore.jr_pysakki stop USING (soltunnus)
                 INNER JOIN jore.jr_pysakkivali seg ON knot.soltunnus = seg.pystunnus1
            WHERE route.route_id = :routeId
              AND route.direction = :direction
              AND knot.sollistunnus IS NOT NULL
            ORDER BY route.route_id, route.direction, route.date_begin, route.date_end, link.stop_id;`,
      { routeId, direction }
    )

    return this.getBatched(query)
  }

  async getJourneyDepartures(
    routeId: string,
    direction: Scalars['Direction'],
    date: string
  ): Promise<JoreRouteDepartureData[]> {
    return []

    const dayTypes = await this.getDayTypesForDateAndRoute(date, routeId)

    const query = this.db.raw(
      `
    SELECT departure.stop_id,
       departure.route_id,
       departure.direction,
       departure.hours,
       departure.minutes,
       departure.day_type,
       departure.extra_departure,
       departure.is_next_day,
       departure.arrival_is_next_day,
       departure.arrival_hours,
       departure.arrival_minutes,
       departure.terminal_time,
       departure.recovery_time,
       departure.equipment_type,
       departure.equipment_required,
       departure.operator_id,
       departure.trunk_color_required,
       departure.date_begin,
       departure.date_end,
       departure.departure_id,
       departure.bid_target_id,
       departure.date_imported,
       departure.train_number
FROM jore.departure departure
WHERE day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
  AND departure.route_id = :routeId
  AND departure.direction = :direction
  AND departure.date_begin <= :date
  AND departure.date_end >= :date
ORDER BY departure.departure_id ASC,
         departure.hours ASC,
         departure.minutes ASC;`,
      { routeId, direction: direction + '', date }
    )

    return this.getBatched(query)
  }

  async getDepartureData(routeId, direction, date): Promise<PlannedJourneyData> {
    return { stops: [], departures: [] }

    const stopsPromise = this.getRouteSegments(routeId, direction)
    const departuresPromise = this.getJourneyDepartures(routeId, direction, date)

    const [stops = [], departures = []] = await Promise.all([stopsPromise, departuresPromise])
    return { stops, departures } as PlannedJourneyData
  }

  departureStopFields = `
stop.stop_id,
stop.lat,
stop.lon,
stop.short_id,
stop.name_fi,
stop.stop_radius,
stop.stop_type,
stop.terminal_id,
route_segment.date_begin,
route_segment.date_end,
route_segment.date_modified,
route_segment.destination_fi,
route_segment.distance_from_previous,
route_segment.distance_from_start,
route_segment.duration,
route_segment.route_id,
route_segment.direction,
route_segment.stop_index,
route_segment.next_stop_id,
route_segment.timing_stop_type,
route.destination_fi,
route.origin_fi,
route.originstop_id,
route.destinationstop_id,
route.route_length,
route.name_fi          as route_name,
jore.route_mode(route) as mode
  `

  async getDeparturesStops(stopId, date, queryLastStop = false): Promise<JoreStopSegment[]> {
    return []

    if (!stopId) {
      return []
    }

    // If querying for the LAST stop of a route, set query last stop to true, otherwise the result is empty.
    // The route.destinationstop_id != :stopId is only for excluding the last stop from stop timetables.
    // In the week view, we need to actually query for the last stop.

    const query = this.db.raw(
      `
      SELECT ${this.departureStopFields}
      FROM jore.route_segment route_segment
      LEFT JOIN jore.route route USING (route_id, direction, date_begin, date_end, date_modified)
      LEFT JOIN jore.stop stop USING (stop_id)
      WHERE route_segment.stop_id = :stopId
        AND route.destinationstop_id != :lastStopId;`,
      { stopId, lastStopId: !queryLastStop ? stopId : '', date }
    )

    return this.getBatched(query)
  }

  async getTerminalDeparturesStops(terminalId, date): Promise<JoreStopSegment[]> {
    return []

    if (!terminalId) {
      return []
    }

    const query = this.db.raw(
      `
      SELECT ${this.departureStopFields}
      FROM jore.stop stop
      LEFT JOIN jore.route_segment route_segment USING (stop_id)
      LEFT JOIN jore.route route USING (route_id, direction, date_begin, date_end, date_modified)
      WHERE stop.terminal_id = :terminalId
        AND route.destinationstop_id != stop.stop_id;`,
      { terminalId, date }
    )

    return this.getBatched(query)
  }

  async getDepartureOperators(date): Promise<string> {
    return ''

    const exceptionDayTypes = await this.getDayTypesForDate(date)
    // TODO: Ensure that the same operator drives both normal and exception days, always.
    // If not, we may need to be more precise with the day types.
    const dayTypes = uniq(flatten(Object.values(exceptionDayTypes)))

    const query = this.db.raw(
      `
SELECT DISTINCT ON (operator_id, route_id, direction, hours, minutes) operator_id, route_id, direction, hours, minutes
FROM jore.departure
    WHERE day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
      AND date_begin <= :date
ORDER BY operator_id, route_id, direction, hours, minutes, date_imported DESC;`,
      { date }
    )

    return this.getCachedAndBatched(query, 24 * 60 * 60)
  }

  departureFields = `
    departure.route_id,
    departure.direction,
    departure.stop_id,
    departure.hours,
    departure.minutes,
    departure.day_type,
    departure.extra_departure,
    departure.is_next_day,
    departure.arrival_is_next_day,
    departure.arrival_hours,
    departure.arrival_minutes,
    departure.terminal_time,
    departure.recovery_time,
    departure.equipment_type,
    departure.equipment_required,
    departure.operator_id,
    departure.trunk_color_required,
    departure.date_begin,
    departure.date_end,
    departure.departure_id,
    departure.bid_target_id,
    departure.date_imported,
    departure.train_number
  `

  originDepartureQueryFragment = `
LEFT JOIN LATERAL (
  SELECT originstop_id,
         route.type
  FROM jore.route route
  WHERE route.route_id = departure.route_id
    AND route.direction = departure.direction
    AND route.date_begin <= departure.date_end
    AND route.date_end >= departure.date_begin
  ORDER BY route.date_modified DESC
  LIMIT 1
) route ON true
LEFT JOIN LATERAL (
  SELECT *
  FROM jore.departure inner_departure
  WHERE inner_departure.stop_id = route.originstop_id
    AND inner_departure.route_id = departure.route_id
    AND inner_departure.direction = departure.direction
    AND inner_departure.date_begin = departure.date_begin
    AND inner_departure.date_end = departure.date_end
    AND inner_departure.departure_id = departure.departure_id
    AND inner_departure.day_type = departure.day_type
  ORDER BY inner_departure.hours ASC, inner_departure.minutes ASC
  LIMIT 1
) origin_departure ON true
  `

  async getDeparturesForStops(
    stopIds: string[],
    date: string
  ): Promise<JoreDepartureWithOrigin[]> {
    return []

    const exceptionDayTypes = await this.getDayTypesForDate(date)
    const dayTypes = uniq(flatten(Object.values(exceptionDayTypes)))

    const query = this.db.raw(
      `
      SELECT ${this.departureFields},
            route.type,
            origin_departure.stop_id as origin_stop_id,
            origin_departure.hours as origin_hours,
            origin_departure.minutes as origin_minutes,
            origin_departure.is_next_day as origin_is_next_day,
            origin_departure.is_next_day as origin_is_next_day,
            origin_departure.extra_departure as origin_extra_departure,
            origin_departure.departure_id as origin_departure_id,
            origin_departure.date_begin as origin_date_begin,
            origin_departure.date_end as origin_date_end
      FROM jore.departure departure
           ${this.originDepartureQueryFragment}
      WHERE departure.stop_id IN (${stopIds.map((stopId) => `'${stopId}'`).join(',')})
        AND departure.day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
        AND departure.date_begin <= :date
        AND departure.date_end >= :date
      ORDER BY departure.hours ASC,
               departure.minutes ASC,
               departure.route_id ASC,
               departure.direction ASC,
               departure.date_imported DESC;`,
      { date }
    )

    const result = await this.getBatched(query)

    return result.filter((departure) => {
      const departureMode = departure.type

      const exceptionDaysForAll = exceptionDayTypes.all || []
      const exceptionDaysForMode =
        (departureMode ? exceptionDayTypes[departureMode] : []) || []

      const filterByDayTypes =
        exceptionDaysForMode.length !== 0
          ? exceptionDaysForMode
          : exceptionDayTypes.normal || []

      const matchDayTypes = [...exceptionDaysForAll, ...filterByDayTypes]
      return matchDayTypes.includes(departure.day_type)
    })
  }

  async getDeparturesForRoute(
    stopId,
    routeId,
    direction,
    date
  ): Promise<JoreDepartureWithOrigin[]> {
    return []

    const dayTypes = await this.getDayTypesForDateAndRoute(date, routeId)

    const query = this.db.raw(
      `
SELECT ${this.departureFields}
FROM jore.departure departure
WHERE departure.stop_id = :stopId
  AND departure.day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
  AND departure.route_id = :routeId
  AND departure.direction = :direction
ORDER BY departure.hours ASC,
         departure.minutes ASC;`,
      { stopId, routeId, direction: direction + '' }
    )

    return this.getBatched(query)
  }

  async getWeeklyDepartures(
    stopId,
    routeId,
    direction,
    exceptionDayTypes: string[] = [],
    lastStopArrival = false
  ): Promise<JoreDeparture[]> {
    return []

    const queryDayTypes = uniq(exceptionDayTypes.concat(dayTypes))

    let query

    if (!lastStopArrival) {
      query = this.db.raw(
        `
SELECT ${this.departureFields}
FROM jore.departure departure
WHERE departure.stop_id = :stopId
  AND departure.day_type IN (${queryDayTypes.map((dayType) => `'${dayType}'`).join(',')})
  AND departure.route_id = :routeId
  AND departure.direction = :direction;`,
        {
          stopId,
          routeId,
          direction: direction + '',
        }
      )
    } else {
      query = this.db.raw(
        `
SELECT ${this.departureFields},
      origin_departure.stop_id as origin_stop_id,
      origin_departure.hours as origin_hours,
      origin_departure.minutes as origin_minutes,
      origin_departure.is_next_day as origin_is_next_day,
      origin_departure.is_next_day as origin_is_next_day,
      origin_departure.extra_departure as origin_extra_departure,
      origin_departure.departure_id as origin_departure_id
FROM jore.departure departure
     ${this.originDepartureQueryFragment}
WHERE departure.stop_id = :stopId
  AND departure.day_type IN (${queryDayTypes.map((dayType) => `'${dayType}'`).join(',')})
  AND departure.route_id = :routeId
  AND departure.direction = :direction;`,
        {
          stopId,
          routeId,
          direction: direction + '',
        }
      )
    }

    return this.getBatched(query)
  }

  async getExceptionDaysForYear(year): Promise<JoreExceptionDay[] | null> {
    if (!year) {
      return null
    }

    const startDate = format(startOfYear(year), 'YYYY-MM-DD')
    const endDate = format(endOfYear(year), 'YYYY-MM-DD')

    const query = this.db.raw(
      `
                SELECT ex_day.eritpoikpvm      date_in_effect,
                       ex_desc.kooselite       description,
                       ex_day.eritviikpaiva    day_type,
                       ex_day.eriteimuita as   exclusive,
                       rep_day.korvjoukkollaji scope,
                       rep_day.korvalkaika     time_begin,
                       rep_day.korvpaataika    time_end,
                       CASE
                           WHEN rep_day.korvpaiva IS NULL
                               THEN ARRAY [ex_day.eritpaiva, ex_day.eritviikpaiva]
                           ELSE ARRAY [ex_day.eritpaiva, rep_day.korvpaiva]
                           END            as   effective_day_types,
                       rep_day.korvpaiva  as   scoped_day_type
                FROM jore.jr_eritpvkalent ex_day
                         LEFT OUTER JOIN jore.jr_koodisto ex_desc ON ex_day.eritpaiva = ex_desc.kookoodi
                         FULL OUTER JOIN jore.jr_korvpvkalent rep_day ON ex_day.eritpoikpvm = rep_day.korvpoikpvm
                WHERE ex_day.eritpoikpvm >= :startDate
                  AND ex_day.eritpoikpvm <= :endDate
                ORDER BY ex_day.eritpoikpvm;
      `,
      { startDate, endDate }
    )

    return this.getBatched(query)
  }

  async getExceptions(date): Promise<ExceptionDay[]> {
    const fetchExceptions: CachedFetcher<ExceptionDay[]> = async (year) => {
      const exceptionDays = await this.getExceptionDaysForYear(year)

      if (!exceptionDays) {
        return false
      }

      const exceptionDayObjects = exceptionDays.reduce(
        (days: ExceptionDay[], day: JoreExceptionDay) => {
          const dayObject = createExceptionDayObject(day)

          if (dayObject) {
            days.push(dayObject)
          }

          return days
        },
        []
      )

      const orderedDays = orderBy(exceptionDayObjects, 'exceptionDate')
      return orderedDays.filter((day) => isSameYear(day.exceptionDate, year))
    }

    const queryYear = getYear(date) + ''
    const cacheKey = `exception_days_${queryYear}`
    const exceptionDays = await cacheFetch<ExceptionDay[]>(
      cacheKey,
      () => fetchExceptions(queryYear),
      24 * 60 * 60
    )

    if (!exceptionDays) {
      return []
    }

    if (date && date.length > 4) {
      return exceptionDays.filter(({ exceptionDate }) => isEqual(exceptionDate, date))
    }

    return exceptionDays
  }

  async getDayTypesForDate(date: string): Promise<ExceptionDaysScoped> {
    const exceptions = await this.getExceptions(date)
    let dayTypes: ExceptionDaysScoped = { normal: [getDayTypeFromDate(date)] }

    if (exceptions && exceptions.length !== 0) {
      dayTypes = exceptions.reduce((exceptionDayTypes: ExceptionDaysScoped, exception) => {
        const currentScope = exception.scope || 'all'
        let scopeValue = exceptionDayTypes[currentScope] || []
        let allScopeValue = (currentScope !== 'all' ? exceptionDayTypes.all : scopeValue) || []

        const nonScopedDayTypes = exception.effectiveDayTypes.filter(
          (dt) => dt !== exception.scopedDayType
        )

        scopeValue = uniq(compact([...scopeValue, exception.scopedDayType]))
        allScopeValue = uniq([...allScopeValue, ...nonScopedDayTypes])

        exceptionDayTypes[currentScope] = scopeValue
        exceptionDayTypes.all = allScopeValue

        return exceptionDayTypes
      }, dayTypes)
    }

    return dayTypes
  }

  async getDayTypesForDateAndRoute(date: string, routeId: string): Promise<string[]> {
    const routeTypeScope = await this.getTypeOfRoute(routeId, date)
    const exceptionTypesScoped = await this.getDayTypesForDate(date)

    const exceptionTypesForScope =
      (!!routeTypeScope ? exceptionTypesScoped[routeTypeScope] : []) || []

    const exceptionTypesForAll = exceptionTypesScoped.all || []

    // If there are no scoped replacement days, also include the normal day type.
    // Otherwise some departures may be missing from the result as non-scoped
    // exception days may not have any departures.
    const includedNormalDays =
      exceptionTypesForScope.length === 0 ? exceptionTypesScoped.normal : []

    return uniq([...exceptionTypesForScope, ...exceptionTypesForAll, ...includedNormalDays])
  }

  async getTypeOfRoute(routeId: string, date: string): Promise<null | string> {
    return null

    const query = this.db.raw(
      `
                SELECT route.date_begin,
                       route.date_end,
                       route.type
                FROM jore.route route
                WHERE route.route_id = :routeId
                  AND route.date_begin <= :date
                  AND route.date_end >= :date
                ORDER BY route.date_imported DESC
                LIMIT 1;
      `,
      { routeId, date }
    )

    const result: Array<{ type: string }> = await this.getBatched(query)

    if (!result || result.length === 0) {
      return null
    }

    return result[0].type
  }
}
