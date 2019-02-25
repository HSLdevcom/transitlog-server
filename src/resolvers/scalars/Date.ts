import { GraphQLScalarType, Kind } from 'graphql'
import { validateDateString } from '../../utils/validateDateString'
import moment from 'moment-timezone'
import { DATE_FORMAT, TIME_FORMAT, TZ } from '../../constants'
import { StringOrNull } from '../../types/NullOr'

function getValue(value: moment | string | number): StringOrNull {
  if (moment.isMoment(value)) {
    return value.format(DATE_FORMAT)
  }

  if (typeof value === 'number') {
    return moment.tz(value, TZ).format(TIME_FORMAT)
  }

  return validateDateString(value)
}

export const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'A Date string in YYYY-MM-DD format.',
  parseValue(value: unknown): moment {
    const dateString = validateDateString(value)
    return moment.tz(dateString, TZ)
  },
  serialize(value: unknown): StringOrNull {
    return getValue(value)
  },
  parseLiteral(ast): StringOrNull {
    if (ast.kind === Kind.STRING) {
      return validateDateString(ast.value)
    }

    if (ast.kind === Kind.INT) {
      return moment.tz(parseInt(ast.value, 10), TZ).format(TIME_FORMAT)
    }

    return null
  },
})
