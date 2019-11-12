import { gql } from 'apollo-server'

export const Equipment = gql`
  type Equipment {
    id: ID!
    vehicleId: String!
    operatorId: String!
    operatorName: String
    registryNr: String
    age: Int
    type: String
    exteriorColor: String
    emissionDesc: String
    emissionClass: String
    inService: Boolean
    _matchScore: Float
  }

  input EquipmentFilterInput {
    vehicleId: String
    operatorId: String
    search: String
  }
`
