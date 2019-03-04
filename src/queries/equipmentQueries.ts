import { gql } from 'apollo-server'

const EquipmentFieldsFragment = gql`
  fragment EquipmentFieldsFragment on Equipment {
    vehicleId
    operatorId
    registryNr
    age
    type
    exteriorColor
    emissionDesc
    emissionClass
  }
`

export const EQUIPMENT = gql`
  query JoreEquipment {
    allEquipment {
      nodes {
        ...EquipmentFieldsFragment
      }
    }
  }
  ${EquipmentFieldsFragment}
`

export const EQUIPMENT_BY_ID = gql`
  query JoreEquipmentById($vehicleId: String, $operatorId: String) {
    allEquipment(condition: { vehicleId: $vehicleId, operatorId: $operatorId }) {
      nodes {
        ...EquipmentFieldsFragment
      }
    }
  }
  ${EquipmentFieldsFragment}
`
