import { cacheFetch } from '../cache'
import { requireUser } from '../auth/requireUser'
import { AuthenticatedUser } from '../types/Authentication'
import { CachedFetcher } from '../types/CachedFetcher'
import { getOperatorName } from '../utils/getOperatorName'

type JoreOperator = {
  operator_id: string
}

type Operator = {
  operatorId: string
  operatorName?: string
}

export async function createOperatorResponse(
  dataFetcher: () => JoreOperator[],
  user?: AuthenticatedUser
): Promise<Operator[] | null> {
  const fetchData: CachedFetcher<Operator[]> = async () => {
    const operators: JoreOperator[] = await dataFetcher()

    if (!operators || operators.length === 0) {
      return false
    }

    return operators.map(
      (op: JoreOperator): Operator => {
        return {
          operatorId: parseInt(op.operator_id, 10) + '',
          operatorName: getOperatorName(op.operator_id),
        }
      }
    )
  }

  if (!requireUser(user, ['HSL'])) {
    return []
  }

  const cacheKey = `operators`
  return cacheFetch<Operator[]>(cacheKey, fetchData, 24 * 60 * 60)
}
