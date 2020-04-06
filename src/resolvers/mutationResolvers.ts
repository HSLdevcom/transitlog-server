import { v4 as uuidv4 } from 'uuid'
import { BlobServiceClient } from '@azure/storage-blob'
import { WebClient, MessageAttachment } from '@slack/web-api'
import {
  SLACK_API_KEY,
  AZURE_FEEDBACK_BLOB_CONN,
  AZURE_FEEDBACK_BLOB_SAS,
} from './../constants'
import { ApolloError } from 'apollo-server'

const slack = new WebClient(SLACK_API_KEY)

const isImageFile = (mimetype): boolean => {
  if (!mimetype.includes('/') || mimetype.split('/')[0] !== 'image') {
    console.log('invalid mimetype')
    return false
  } else {
    return true
  }
}

export const mutationResolvers = {
  sendFeedback: async (parent, args) => {
    const { text, email, url } = args
    const fromStr = email !== '' ? email.trim() : 'anonymous user'
    const feedbackRes: any = await slack.chat.postMessage({
      channel: 'C010S7YF98E',
      text: '*' + fromStr + '*\n\n' + text.trim(),
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

    if (isImageFile(mimetype)) {
      // upload image to azure blob
      const blobName = uuidv4() + '.' + filename.split('.').pop()
      const blobServiceClient = await BlobServiceClient.fromConnectionString(
        AZURE_FEEDBACK_BLOB_CONN
      )
      const container = blobServiceClient.getContainerClient('feedback-images')
      const blockBlob = container.getBlockBlobClient(blobName)
      blockBlob.uploadStream(createReadStream())

      const downloadUrl =
        'https://feedbackfiles.blob.core.windows.net/feedback-images/' +
        blobName +
        AZURE_FEEDBACK_BLOB_SAS

      // post download link to slack
      const downloadLink = '<' + downloadUrl + `|download attached image: ${filename}>`
      const attachment: MessageAttachment = { image_url: downloadUrl }

      await slack.chat.postMessage({
        channel: 'C010S7YF98E',
        thread_ts: msgTs,
        text: downloadLink,
        attachments: [attachment],
      })

      return { filename, mimetype, encoding }
    } else {
      throw new ApolloError('Invalid image file type')
    }
  },
}
