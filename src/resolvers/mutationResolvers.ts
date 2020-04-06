import { v4 as uuidv4 } from 'uuid'
import { BlobServiceClient } from '@azure/storage-blob'
import { WebClient, MessageAttachment } from '@slack/web-api'

const slack = new WebClient(process.env.SLACK_API_KEY)
const azureStorageConn: any = process.env.AZURE_FEEDBACK_BLOB_CONN
const azureBlobSas: any = process.env.AZURE_FEEDBACK_BLOB_SAS

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

    // upload image to azure blob
    const blobName = uuidv4() + '.' + filename.split('.').pop()
    const blobServiceClient = await BlobServiceClient.fromConnectionString(azureStorageConn)
    const container = blobServiceClient.getContainerClient('feedback-images')
    const blockBlob = container.getBlockBlobClient(blobName)
    blockBlob.uploadStream(createReadStream())

    const downloadUrl =
      'https://feedbackfiles.blob.core.windows.net/feedback-images/' + blobName + azureBlobSas

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
  },
}
