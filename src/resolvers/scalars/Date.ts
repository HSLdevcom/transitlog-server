import { GraphQLScalarType, Kind } from 'graphql'
import { validateDateString } from '../../utils/validateDateString'
import moment from 'moment-timezone'
import { DATE_FORMAT, TIME_FORMAT, TIMEZONE } from '../../constants'

function getValue(value) {
  if (moment.isMoment(value)) {
    return value.format(DATE_FORMAT)
  }

  if (typeof value === 'number') {
    return moment.tz(value, TIMEZONE).format(TIME_FORMAT)
  }

  return validateDateString(value)
}

export const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'A Date string in YYYY-MM-DD format.',
  parseValue(value) {
    const dateString = validateDateString(value)
    return moment.tz(dateString, TIMEZONE)
  },
  serialize(value) {
    return getValue(value)
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return validateDateString(ast.value)
    }

    if (ast.kind === Kind.INT) {
      return moment.tz(parseInt(ast.value, 10), TIMEZONE).format(TIME_FORMAT)
    }

    return null
  },
})
