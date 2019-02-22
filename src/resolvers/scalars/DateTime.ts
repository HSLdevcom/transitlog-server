import { GraphQLScalarType, Kind } from 'graphql'
import moment from 'moment-timezone'
import { TIMEZONE } from '../../constants'

function getValue(value) {
  if (['number', 'string'].includes(typeof value)) {
    return moment.tz(value, TIMEZONE).toISOString(true)
  }

  if (moment.isMoment(value)) {
    return value.toISOString(true)
  }

  return null
}

export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description:
    'A DateTime string in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). Timezone will be converted to the server timezone.',
  parseValue(value) {
    const momentValue = moment.tz(value, TIMEZONE)
    return momentValue.isValid() ? momentValue : null
  },
  serialize(value) {
    return getValue(value)
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
      return moment.tz(ast.value, TIMEZONE).toISOString(true)
    }

    return null
  },
})
