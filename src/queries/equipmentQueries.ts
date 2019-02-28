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
