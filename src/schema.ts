import { Schema } from './schema/Schema'
import { Route } from './schema/Route'
import { Stop } from './schema/Stop'
import { Departure } from './schema/Departure'
import { Journey } from './schema/Journey'
import { Equipment } from './schema/Equipment'
import { ExceptionDays } from './schema/ExceptionDay'
import { Alerts } from './schema/Alerts'
import { DriverEvent } from './schema/DriverEvent'

export default [
  Route,
  Stop,
  Departure,
  Journey,
  DriverEvent,
  Equipment,
  ExceptionDays,
  Alerts,
  Schema,
]
