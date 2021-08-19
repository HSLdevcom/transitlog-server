import { GraphQLScalarType, Kind } from 'graphql'
import moment from 'moment-timezone'
import { TZ } from '../../constants'
import { StringOrNull } from '../../types/NullOr'

function getStringValue(value) {
  if (['number', 'string'].includes(typeof value)) {
    return moment.tz(value, TZ).toISOString(true)
  }

  if (moment.isMoment(value)) {
    return value.toISOString(true)
  }

  return null
}

function getMoment(value): moment.Moment | null {
  const momentValue = moment.tz(value, TZ)
  return momentValue.isValid() ? momentValue : null
}

// TODO: Review return values

export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: `A DateTime string in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). Timezone will be converted to ${TZ}.`,
  parseValue(value): moment.Moment | null {
    return getMoment(value)
  },
  serialize(value): StringOrNull {
    return getStringValue(value)
  },
  parseLiteral(ast): moment.Moment | null {
    if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
      return getMoment(ast.value)
    }

    return null
  },
})
