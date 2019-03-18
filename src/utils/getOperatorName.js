import get from 'lodash/get'
import operators from '../../operators.json'

export function getOperatorName(operatorId) {
  if (!operatorId) {
    return ''
  }

  const cleanId = parseInt(operatorId, 10) + ''
  return get(operators, cleanId, cleanId)
}
