import {
  JoreDeparture,
  JoreDepartureWithOrigin,
  JoreEquipment,
  JoreExceptionDay,
  JoreRoute,
  JoreRouteGeometry,
  JoreRouteSegment,
  JoreRouteStop,
  JoreStop,
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
import { Direction } from 'tty'

const knex = getKnex(databases.JORE)

type ExceptionDaysScoped = {
  normal: string[]
  [scope: string]: string[]
}

let routeModeQuery =
  // language=PostgreSQL
  () => `
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

let stopModeQuery =
  // language=PostgreSQL
  () => `
    SELECT DISTINCT ON (link.lnkalkusolmu)
        link.lnkalkusolmu,
        case
            when line.linjoukkollaji is null then 'BUS'
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
                 LEFT JOIN jore.jr_linja line ON line.lintunnus = LEFT(link.reitunnus, 4)
        WHERE link.relpysakki != 'E'
        ORDER BY link.lnkalkusolmu
`

let routeQuery = (routeId?: string, direction?: number) => {
  let where =
    routeId && direction
      ? `dir.reitunnus = :routeId
  AND dir.suusuunta = :direction
  AND `
      : ''

  // language=PostgreSQL
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
        route_mode.mode,
        line.linjoukkollaji route_type                            
    FROM jore.jr_reitinsuunta dir
      LEFT JOIN jore.jr_reitti route USING (reitunnus)
      LEFT JOIN route_mode USING (reitunnus)
      LEFT JOIN jore.jr_linja line ON line.lintunnus = SUBSTRING(dir.reitunnus, 0, 4)
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

  // language=PostgreSQL
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
    // language=PostgreSQL
    const query = this.db.raw(`
      WITH route_mode AS (${routeModeQuery()})
      ${routeQuery()};
    `)
    return this.getBatched(query)
  }

  async getRoute(routeId: string, direction: number): Promise<JoreRoute[]> {
    // language=PostgreSQL
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

  async getRouteStop(stopId: string, date: string): Promise<JoreRouteStop[]> {
    // language=PostgreSQL
    const query = this.db.raw(
      `
WITH route_mode AS (${routeModeQuery()}),
route_query AS (${routeQuery()})
SELECT DISTINCT ON (link.reitunnus, link.suusuunta, link.suuvoimast)
    CASE WHEN link.lnkloppusolmu = route.destinationstop_id
             THEN link.lnkloppusolmu
         ELSE link.lnkalkusolmu
    END stop_id,
    ((knot.solkirjain || knot.sollistunnus)) short_id,
    knot.solstmx lat,
    knot.solstmy lon,
    stop.pysnimi name_fi,
    stop.pyssade stop_radius,
    route.date_begin,
    route.date_end,
    route.route_id,
    route.direction,
    route.originstop_id,
    route.destination_fi,
    route.origin_fi,
    route.mode,
    route.route_name,
    CASE WHEN link.ajantaspys IS NULL THEN FALSE
         ELSE CASE WHEN link.ajantaspys = 0 THEN FALSE
                   ELSE TRUE END
        END timing_stop_type
    FROM jore.jr_reitinlinkki link
         LEFT JOIN route_query route ON route.route_id = link.reitunnus
                                    AND route.direction = link.suusuunta
                                    AND route.date_begin = link.suuvoimast
         LEFT JOIN jore.jr_pysakki stop ON stop.soltunnus = (
                  CASE WHEN link.lnkloppusolmu = route.destinationstop_id
                       THEN link.lnkloppusolmu
                       ELSE link.lnkalkusolmu
                  END
              )
         LEFT JOIN jore.jr_solmu knot ON stop.soltunnus = knot.soltunnus
    WHERE link.relpysakki != 'E'
      AND stop.soltunnus = :stopId
      AND :date BETWEEN route.date_begin AND route.date_end
    ORDER BY link.reitunnus, link.suusuunta, link.suuvoimast;
   `,
      { stopId, date }
    )

    return this.getBatched(query)
  }

  async getRouteStops(
    routeId: string,
    direction: Direction,
    date: string
  ): Promise<JoreRouteStop[]> {
    // language=PostgreSQL
    const query = this.db.raw(
      `
WITH route_mode AS (${routeModeQuery()}),
  route_query AS (${routeQuery()}),
  stop_link AS (
    SELECT DISTINCT ON (route.route_id, route.direction, route.date_begin, route.date_end, link.lnkalkusolmu)
        route.*,
        (row_number() OVER (
            PARTITION BY route.route_id, route.direction, route.date_begin, route.date_end
            ORDER BY link.reljarjnro::integer
        ))::integer stop_index,
        CASE WHEN link.ajantaspys IS NULL THEN FALSE
            ELSE CASE WHEN link.ajantaspys = 0 THEN FALSE
            ELSE TRUE END
        END timing_stop_type,
        CASE WHEN link.lnkloppusolmu = route.destinationstop_id
              THEN link.lnkloppusolmu
          ELSE link.lnkalkusolmu
        END stop_id
    FROM route_query route
          LEFT JOIN jore.jr_reitinlinkki link ON route.route_id = link.reitunnus
             AND route.direction = link.suusuunta
             AND route.date_begin = link.suuvoimast
             AND link.relpysakki != 'E'
          INNER JOIN jore.jr_pysakki stop ON stop.soltunnus = (
                CASE WHEN link.lnkloppusolmu = route.destinationstop_id
                      THEN link.lnkloppusolmu
                      ELSE link.lnkalkusolmu
                END
          )
    ORDER BY route.route_id, route.direction, route.date_begin, route.date_end, link.lnkalkusolmu, link.reljarjnro, link.suuvoimast DESC
  )
SELECT DISTINCT ON (route.stop_id, route.route_id, route.direction, route.date_begin, route.date_end)
    route.stop_id,
    ((knot.solkirjain || knot.sollistunnus)) short_id,
    knot.solstmx lat,
    knot.solstmy lon,
    stop.pysnimi name_fi,
    stop.pyssade stop_radius,
    route.date_begin,
    route.date_end,
    route.route_id,
    route.direction,
    route.timing_stop_type,
    route.stop_index,
    route.originstop_id,
    route.destination_fi,
    route.origin_fi,
    route.route_name,
    route.mode,
    CASE WHEN route.stop_index::integer <> 1 THEN seg.pituus ELSE 0 END distance_from_previous,
    (SUM(CASE WHEN route.stop_index::integer <> 1 THEN seg.pituus END) OVER (
        PARTITION BY route.route_id, route.direction, route.date_begin, route.date_end
        ORDER BY route.stop_index::integer
    ))::integer distance_from_start
FROM stop_link route
     INNER JOIN jore.jr_pysakki stop ON stop.soltunnus = route.stop_id
     INNER JOIN jore.jr_solmu knot on route.stop_id = knot.soltunnus
     LEFT JOIN jore.jr_pysakkivali seg ON knot.soltunnus = seg.pystunnus1
WHERE :date BETWEEN route.date_begin AND route.date_end
  AND :routeId = route.route_id
  AND :direction = route.direction
ORDER BY route.stop_id, route.route_id, route.direction, route.date_begin, route.date_end, route.stop_index::integer;`,
      { routeId, direction, date }
    )

    return this.getBatched(query)
  }

  async getStops(): Promise<JoreStop[]> {
    // language=PostgreSQL
    const query = this.db.raw(
      `
      WITH stop_mode AS (${stopModeQuery()})
      SELECT DISTINCT ON (stop.soltunnus)
          stop.soltunnus stop_id,
          (knot.solkirjain || knot.sollistunnus) short_id,
          knot.solstmx lat,
          knot.solstmy lon,
          stop.pysnimi name_fi,
          stop.pyssade stop_radius,
          mode_query.modes
      FROM jore.jr_pysakki stop
          LEFT JOIN jore.jr_solmu knot USING (soltunnus)
          LEFT JOIN (
              SELECT array_agg(mode) as modes,
                     sm.lnkalkusolmu
              FROM stop_mode sm
              GROUP BY sm.lnkalkusolmu
          ) mode_query ON mode_query.lnkalkusolmu = stop.soltunnus
      WHERE knot.sollistunnus IS NOT NULL
        AND knot.solkirjain NOT LIKE 'X%'
      ORDER BY stop.soltunnus, knot.solviimpvm DESC;
        `
    )

    let result = await this.getBatched(query)
    return result.filter((res) => !!res.stop_id && !!res.short_id)
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
                 mode_query.modes
          FROM jore.jr_lij_terminaalialue terminal
               LEFT JOIN jore.jr_pysakki stop ON stop.terminaali = terminal.termid
               LEFT JOIN (
                   SELECT array_agg(DISTINCT mode) as modes,
                          sm.lnkalkusolmu
                   FROM stop_mode sm
                   GROUP BY sm.lnkalkusolmu
               ) mode_query ON mode_query.lnkalkusolmu = stop.soltunnus
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

    // language=PostgreSQL
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

  async getRouteSegments(routeId: string, direction: number): Promise<JoreRouteSegment[]> {
    // TODO: Query for segment duration
    // language=PostgreSQL
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
            (SUM(CASE WHEN link.stop_index::integer <> 1 THEN seg.pituus END) OVER (
                PARTITION BY route.route_id, route.direction, route.date_begin, route.date_end
                ORDER BY link.stop_index::integer
            ))::integer distance_from_start
            FROM route_query route
                 LEFT JOIN stop_link link USING (route_id, direction, date_begin, date_end)
                 LEFT JOIN jore.jr_solmu knot ON link.stop_id = knot.soltunnus
                 LEFT JOIN jore.jr_pysakki stop USING (soltunnus)
                 LEFT JOIN jore.jr_pysakkivali seg ON knot.soltunnus = seg.pystunnus1
            WHERE route.route_id = :routeId
              AND route.direction = :direction
            ORDER BY route.route_id, route.direction, route.date_begin, route.date_end, link.stop_id;`,
      { routeId, direction }
    )

    return this.getBatched(query)
  }

  departureFields = `
    departure.route_id,
    departure.direction,
    departure.stop_id,
    departure.origin_stop_id,
    departure.origin_hours,
    departure.origin_minutes,
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
    departure.is_timing_stop,
    departure.equipment_type,
    departure.equipment_required,
    departure.operator_id,
    departure.trunk_color_required,
    departure.date_begin,
    departure.date_end,
    departure.departure_id,
    departure.procurement_unit_id,
    departure.train_number,
    departure.date_modified
  `

  async getJourneyDepartures(
    routeId: string,
    direction: Scalars['Direction'],
    date: string
  ): Promise<JoreDeparture[]> {
    const dayTypes = await this.getDayTypesForDateAndRoute(date, routeId)

    // language=PostgreSQL
    const query = this.db.raw(
      `
    SELECT DISTINCT ON (stop_id, route_id, direction, day_type, hours, minutes, extra_departure, is_next_day, date_begin, date_end)
           ${this.departureFields}
FROM jore.departure departure
WHERE day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
  AND departure.route_id = :routeId
  AND departure.direction = :direction
ORDER BY stop_id, route_id, direction, day_type, hours, minutes, extra_departure, is_next_day, date_begin DESC, date_end DESC, date_modified DESC;`,
      { routeId, direction: direction + '', date }
    )

    return this.getBatched(query)
  }

  async getDepartureData(routeId, direction, date): Promise<PlannedJourneyData> {
    const routePromise = this.getRouteSegments(routeId, direction)
    const departuresPromise = this.getJourneyDepartures(routeId, direction, date)

    const [routes = [], departures = []] = await Promise.all([routePromise, departuresPromise])
    return { routes, departures } as PlannedJourneyData
  }

  async getDepartureOperators(date): Promise<string> {
    const exceptionDayTypes = await this.getDayTypesForDate(date)
    // If not, we may need to be more precise with the day types.
    const dayTypes = uniq(flatten(Object.values(exceptionDayTypes)))

    // language=PostgreSQL
    const query = this.db.raw(
      `
SELECT DISTINCT ON (operator_id, route_id, direction, hours, minutes)
      operator_id,
      route_id,
      direction,
      hours,
      minutes
FROM jore.departure
    WHERE day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
      AND date_begin <= :date
ORDER BY operator_id, route_id, direction, hours, minutes, date_imported DESC;`,
      { date }
    )

    return this.getCachedAndBatched(query, 24 * 60 * 60)
  }

  async getDeparturesForStops(
    stopIds: string[],
    date: string
  ): Promise<JoreDepartureWithOrigin[]> {
    const exceptionDayTypes = await this.getDayTypesForDate(date)
    const dayTypes = uniq(flatten(Object.values(exceptionDayTypes)))

    // language=PostgreSQL
    const query = this.db.raw(
      `
      SELECT DISTINCT ON (stop_id, route_id, direction, day_type, hours, minutes, extra_departure, is_next_day, date_begin, date_end)
        ${this.departureFields},
        route.linjoukkollaji AS type
      FROM jore.departure departure
           LEFT JOIN jore.jr_linja route ON route.lintunnus = SUBSTRING(departure.route_id, 0, 4) 
      WHERE departure.stop_id IN (${stopIds.map((stopId) => `'${stopId}'`).join(',')})
        AND departure.day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
      ORDER BY stop_id, route_id, direction, day_type, hours, minutes, extra_departure, is_next_day, date_begin DESC, date_end DESC, date_modified DESC;`,
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
    routeId: string,
    direction: number,
    date: string
  ): Promise<JoreDepartureWithOrigin[]> {
    const dayTypes = await this.getDayTypesForDateAndRoute(date, routeId)

    // language=PostgreSQL
    const query = this.db.raw(
      `
SELECT DISTINCT ON (stop_id, route_id, direction, day_type, origin_hours, origin_minutes, extra_departure, is_next_day, date_begin, date_end)
       ${this.departureFields}
FROM jore.departure departure
WHERE departure.stop_id = departure.origin_stop_id
  AND departure.day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
  AND departure.route_id = :routeId
  AND departure.direction = :direction
ORDER BY stop_id, route_id, direction, day_type, origin_hours, origin_minutes, extra_departure, is_next_day, date_begin DESC, date_end DESC, date_modified DESC;`,
      { routeId, direction }
    )

    return this.getBatched(query)
  }

  async getWeeklyDepartures(
    stopId,
    routeId,
    direction,
    exceptionDayTypes: string[] = []
  ): Promise<JoreDeparture[]> {
    const queryDayTypes = uniq(exceptionDayTypes.concat(dayTypes))

    // language=PostgreSQL
    let query = this.db.raw(
      `
SELECT DISTINCT ON (stop_id, route_id, direction, day_type, origin_hours, origin_minutes, extra_departure, is_next_day, date_begin, date_end)
       ${this.departureFields}
FROM jore.departure departure
WHERE departure.stop_id = :stopId
  AND departure.day_type IN (${queryDayTypes.map((dayType) => `'${dayType}'`).join(',')})
  AND departure.route_id = :routeId
  AND departure.direction = :direction
ORDER BY stop_id, route_id, direction, day_type, origin_hours, origin_minutes, extra_departure, is_next_day, date_begin DESC, date_end DESC, date_modified DESC;`,
      {
        stopId,
        routeId,
        direction: direction + '',
      }
    )

    return this.getBatched(query)
  }

  async getExceptionDaysForYear(year): Promise<JoreExceptionDay[] | null> {
    if (!year) {
      return null
    }

    const startDate = format(startOfYear(year), 'YYYY-MM-DD')
    const endDate = format(endOfYear(year), 'YYYY-MM-DD')

    // language=PostgreSQL
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
