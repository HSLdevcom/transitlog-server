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
  description: `A Date string in YYYY-MM-DD format. The timezone is assumed to be ${TZ}.`,
  parseValue(value: unknown): StringOrNull {
    return validateDateString(value)
  },
  serialize(value: unknown): StringOrNull {
    return getValue(value)
  },
  parseLiteral(ast): StringOrNull {
    if (ast.kind === Kind.STRING) {
      return validateDateString(ast.value)
    }

    return null
  },
})
