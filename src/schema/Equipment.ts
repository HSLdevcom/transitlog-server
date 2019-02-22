import { gql } from 'apollo-server'

export const Equipment = gql`
  type Equipment {
    id: ID!
    vehicleId: String!
    operatorId: String!
    registryNr: String!
    age: Int
    type: String!
    exteriorColor: String
    class: String
    emissionDesc: String
    emissionClass: String
  }
  
  input EquipmentFilterInput {
    vehicleId: String
    operatorId: String
    search: String
  }
`
