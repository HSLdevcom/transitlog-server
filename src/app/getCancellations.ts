import {
  AlertCategory,
  Cancellation,
  CancellationSubcategory,
} from '../types/generated/schema-types'
import { getLatestCancellationState } from '../utils/getLatestCancellationState'
import { DBCancellation } from '../types/EventsDb'
import { CachedFetcher } from '../types/CachedFetcher'
import { createCancellation } from './objects/createCancellation'
import { cacheFetch } from './cache'
import { getDirection } from '../utils/getDirection'
import moment from 'moment-timezone'
import { TZ } from '../constants'
import { AuthenticatedUser } from '../types/Authentication'
import { requireUser } from '../auth/requireUser'
import { JoreDepartureOperator } from '../types/Jore'
import { isToday } from 'date-fns'

export type CancellationSearchProps = {
  all?: boolean
  routeId?: string
  direction?: number
  departureTime?: string
  latestOnly?: boolean
}

export const getCancellations = async (
  user: AuthenticatedUser,
  fetchCancellations: (date: string) => DBCancellation[],
  fetchOperators: () => Promise<JoreDepartureOperator[]>,
  date: string,
  cancellationSearchProps: CancellationSearchProps,
  skipCache: boolean = false
): Promise<Cancellation[]> => {
  const {
    routeId,
    departureTime,
    direction,
    all,
    latestOnly = false,
  } = cancellationSearchProps
  const onlyDate = moment.tz(date, TZ).format('YYYY-MM-DD')

  const cancellationFetcher: CachedFetcher<Cancellation[]> = async () => {
    const cancellations = await fetchCancellations(onlyDate)

    if (cancellations.length === 0) {
      return false
    }

    return cancellations.map((cancellation) => createCancellation(cancellation))
  }

  const operatorFetcher: CachedFetcher<JoreDepartureOperator[]> = async () => {
    const operators = await fetchOperators()

    if (operators.length === 0) {
      return false
    }

    return operators
  }

  const cancellationsCacheKey = `cancellations_${onlyDate}`
  let cancellations = await cacheFetch<Cancellation[]>(
    cancellationsCacheKey,
    cancellationFetcher,
    isToday(onlyDate) ? 5 * 60 : 24 * 60 * 60,
    skipCache
  )

  if (!cancellations) {
    return []
  }

  // Cleans the data behind authorization if the user is not logged in or part of HSL.
  if (!requireUser(user, 'HSL')) {
    let operators: JoreDepartureOperator[] = []

    // Fetch departures if there is a user. Unnecessary to fetch otherwise.
    if (user) {
      const operatorsCacheKey = `cancellation_operators_${onlyDate}`
      const operatorDepartures = await cacheFetch<JoreDepartureOperator[]>(
        operatorsCacheKey,
        operatorFetcher,
        24 * 60 * 60
      )

      operators = operatorDepartures || []
    }

    cancellations = cancellations.map((cancellation) => {
      let operatorGroup = 'HSL'

      if (user) {
        const { journeyStartTime, routeId, direction } = cancellation
        const [hours, minutes] = (journeyStartTime || '')
          .split(':')
          .map((val) => parseInt(val, 10))

        const operator = operators.find((operator) => {
          return (
            operator.route_id === routeId &&
            getDirection(operator.direction) === direction &&
            operator.hours === hours &&
            operator.minutes === minutes
          )
        })

        operatorGroup = !operator ? 'HSL' : 'op_' + parseInt(operator.operator_id, 10)
      }

      if (!requireUser(user, operatorGroup)) {
        cancellation.title = ''
        cancellation.description = ''
        cancellation.category = AlertCategory.Hidden
        cancellation.subCategory = CancellationSubcategory.Hidden
      }

      return cancellation
    })
  }

  if (all) {
    return cancellations
  }

  if (latestOnly) {
    // If requested, only the latest info existing about a departure is returned.
    cancellations = getLatestCancellationState(cancellations)
  }

  let filteredCancellations: Cancellation[] = cancellations

  if (routeId) {
    filteredCancellations = filteredCancellations.filter((cancellation) => {
      let match = cancellation.routeId === routeId

      if (!direction && !departureTime) {
        return match
      }

      if (direction) {
        match = match && getDirection(direction) === cancellation.direction
      }

      if (departureTime) {
        match = match && departureTime.startsWith(cancellation.journeyStartTime)
      }

      return match
    })
  }

  return filteredCancellations
}
