import { Schema } from './schema/Schema'
import { Route } from './schema/Route'
import { Stop } from './schema/Stop'
import { Departure } from './schema/Departure'
import { Journey } from './schema/Journey'
import { Equipment } from './schema/Equipment'
import { Line } from './schema/Line'
import { ExceptionDays } from './schema/ExceptionDay'
import { Disruptions } from './schema/Disruptions'

export default [
  Route,
  Line,
  Stop,
  Departure,
  Journey,
  Equipment,
  ExceptionDays,
  Disruptions,
  Schema,
]
