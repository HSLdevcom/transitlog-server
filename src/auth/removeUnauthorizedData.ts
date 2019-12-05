import { AuthenticatedUser } from '../types/Authentication'
import { getUserGroups } from './requireUser'
import { compact } from 'lodash'
import { HSL_GROUP_NAME } from '../constants'
import { Maybe, Scalars } from '../types/generated/schema-types'

type DataType = {
  operatorId?: Maybe<Scalars['String']>
  operator_id?: Maybe<Scalars['String']>
}

export function removeUnauthorizedData<T extends DataType>(
  items: T[],
  user: AuthenticatedUser,
  removeProperties: string[]
): T[] {
  if (removeProperties.length === 0) {
    return items
  }

  function removeData(matchOperators: string | string[] = '') {
    // An array of operator ID's without falsies. If the operatorId of the item
    // matches one of these, the props are KEPT.
    const matchOperatorsArr = compact(
      Array.isArray(matchOperators) ? matchOperators : [matchOperators]
    )

    return items.map((item) => {
      const itemOperator = parseInt(item?.operatorId || item?.operator_id || '0', 10) + ''
      // Flip this to false if an operator ID matches to keep the data.
      let shouldRemove = true

      // Check if any provided operator ID matches the operator ID of the item.
      if (matchOperatorsArr.length !== 0 && itemOperator) {
        for (const op of matchOperatorsArr) {
          if (op === itemOperator) {
            shouldRemove = false // This means that the data should be kept
          }
        }
      }

      // If there were no matches, the data is nulled.
      if (shouldRemove) {
        for (const rmProp of removeProperties) {
          item[rmProp] = null
        }
      }

      return item
    })
  }

  const userGroups = getUserGroups(user)

  if (userGroups.length === 0) {
    return removeData()
  }

  // Users with the HSL group can see all data.
  if (userGroups.includes(HSL_GROUP_NAME)) {
    return items
  }

  const operatorIds = userGroups
    .filter((group) => group.startsWith('op_'))
    .map((group) => group.replace('op_', ''))

  return removeData(operatorIds)
}
