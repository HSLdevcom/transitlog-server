import { gql } from 'apollo-server'

export const Route = gql`
  type Route {
    id: ID!
    lineId: String!
    routeId: String!
    direction: Direction!
    destination: String
    origin: String
    name: String
    destinationStopId: String
    originStopId: String
  }

  type Line {
    id: ID!
    lineId: String!
    name: String
  }

  type RouteGeometryPoint implements Position {
    lat: Float!
    lng: Float!
  }

  type RouteGeometry {
    coordinates: [RouteGeometryPoint!]!
  }

  input RouteFilterInput {
    routeId: String
    direction: Direction
  }

  input LineFilterInput {
    lineId: String
  }
`
