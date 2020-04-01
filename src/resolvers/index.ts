import { queryResolvers } from './queryResolvers'
import { DateScalar } from './scalars/Date'
import { TimeScalar } from './scalars/Time'
import { DateTimeScalar } from './scalars/DateTime'
import { VehicleIdScalar } from './scalars/VehicleId'
import { BBoxScalar, PreciseBBoxScalar } from './scalars/BBox'
import { DirectionScalar } from './scalars/Direction'
import { StringIndexed } from '../types/StringIndexed'
import { WebClient } from '@slack/web-api'
import { v4 as uuidv4 } from 'uuid'
import { BlobServiceClient } from '@azure/storage-blob'

const slack = new WebClient(process.env.SLACK_API_KEY)
const azureStorageConn: any = process.env.AZURE_FEEDBACK_BLOB_CONN
const azureBlobSas: any = process.env.AZURE_FEEDBACK_BLOB_SAS

export const resolvers: StringIndexed<any> = {
  Query: { ...queryResolvers, uploads: (parent, args) => {} },
  Mutation: {
    sendFeedback: async (parent, args) => {
      const { text, email, url } = args
      console.log('received feedback args', args)
      const feedbackRes: any = await slack.chat.postMessage({
        channel: 'C010S7YF98E',
        text: '*' + email.trim() + '*\n\n' + text.trim(),
      })
      const msgTs = feedbackRes.ts
      await slack.chat.postMessage({
        channel: 'C010S7YF98E',
        thread_ts: msgTs,
        text: '<' + url + '>',
      })
      return { text, email, msgTs }
    },
    uploadFeedbackImage: async (parent, { file, msgTs }) => {
      const { createReadStream, filename, mimetype, encoding } = await file
      console.log('uploading file', filename)

      // upload image to azure blob
      const blobName = uuidv4() + '.' + filename.split('.').pop()
      const blobServiceClient = await BlobServiceClient.fromConnectionString(azureStorageConn)
      const container = blobServiceClient.getContainerClient('feedback-images')
      const blockBlob = container.getBlockBlobClient(blobName)
      blockBlob.uploadStream(createReadStream())

      // post download link to slack
      const downloadLink =
        '<https://feedbackfiles.blob.core.windows.net/feedback-images/' +
        blobName +
        azureBlobSas +
        `|download attached image: ${filename}>`

      console.log('downloadLink', downloadLink)
      console.log('msgTs for upload', msgTs)

      const imageLinkRes = await slack.chat.postMessage({
        channel: 'C010S7YF98E',
        thread_ts: msgTs,
        text: downloadLink,
      })

      console.log('imageLinkRes', imageLinkRes)
      return { filename, mimetype, encoding }
    },
  },
  Date: DateScalar,
  Time: TimeScalar,
  DateTime: DateTimeScalar,
  VehicleId: VehicleIdScalar,
  BBox: BBoxScalar,
  PreciseBBox: PreciseBBoxScalar,
  Direction: DirectionScalar,
  JourneyEventType: {
    __resolveType(obj) {
      if (
        typeof obj.plannedDateTime !== 'undefined' &&
        typeof obj.recordedAt === 'undefined'
      ) {
        return 'PlannedStopEvent'
      }

      if (
        typeof obj.isCancelled !== 'undefined' &&
        typeof obj.cancellationType !== 'undefined'
      ) {
        return 'JourneyCancellationEvent'
      }
      if (typeof obj.junctionId !== 'undefined') {
        return 'JourneyTlpEvent'
      }
      if (
        typeof obj.stopId !== 'undefined' &&
        typeof obj.recordedAt !== 'undefined' &&
        typeof obj.plannedDate !== 'undefined'
      ) {
        return 'JourneyStopEvent'
      }

      return 'JourneyEvent'
    },
  },
  Position: {
    __resolveType(obj) {
      if (obj.recordedAt) {
        return 'JourneyEvent'
      }

      if (obj.stopId && !obj.routeId && !obj.routes) {
        return 'SimpleStop'
      }

      if (obj.stopId && !obj.routeId) {
        return 'Stop'
      }

      if (obj.stopId && obj.routeId) {
        return 'RouteSegment'
      }

      if (Object.keys(obj).length === 2) {
        return 'RouteGeometryPoint'
      }

      return null
    },
  },
}
