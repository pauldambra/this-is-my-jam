import * as templates from './templates'

import * as AWSXRay from 'aws-xray-sdk'
import * as untracedAWSSDK from 'aws-sdk'
import { sortToots, StoredToot } from '../poll-for-jams/last-stored-toot'
import { oEmbedHTML } from './get-twitter-oembed'

const AWS = AWSXRay.captureAWS(untracedAWSSDK)

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })
const s3 = new AWS.S3({ apiVersion: '2006-03-01' })
const cloudfront = new AWS.CloudFront({ apiVersion: '2019-03-26' })

module.exports.generate = async (event): Promise<object> => {
  if (!process.env.TOOT_TABLE_NAME || !process.env.WEB_BUCKET || !process.env.CLOUDFRONT_DISTRIBUTION) {
    console.log(`must provide env variables:
    toot table: ${process.env.TOOT_TABLE_NAME}
    web bucket: ${process.env.WEB_BUCKET}
    cloudfront distribution: ${process.env.CLOUDFRONT_DISTRIBUTION}`)
    return {
      statusCode: 400
    }
  }

  const { Items } = await docClient.scan({
    TableName: process.env.TOOT_TABLE_NAME
  }).promise()

  const byDate: Array<StoredToot> = sortToots<StoredToot>(Items)
  const mostRecent: StoredToot = byDate[0]
  const tootHTML = await oEmbedHTML(mostRecent.user, mostRecent.id)
  const decodedHTML = tootHTML.html.replace(/\\"/g, '"').replace(/\n/g, '')
  console.log({ from: tootHTML.html, to: decodedHTML }, 'change in embed html')
  const indexHTML = templates.htmlPage(decodedHTML)

  try {
    const uploadParams = {
      Bucket: process.env.WEB_BUCKET,
      Key: 'index.html',
      ContentType: 'binary',
      Body: Buffer.from(indexHTML, 'binary')
    }

    await s3.putObject(uploadParams).promise()

    const invalidationParams = {
      DistributionId: process.env.CLOUDFRONT_DISTRIBUTION,
      InvalidationBatch: {
        CallerReference: `index-invalidation-${new Date().toISOString()}`,
        Paths: {
          Quantity: 1,
          Items: [
            '/index.html'
          ]
        }
      }
    }
    await cloudfront.createInvalidation(invalidationParams).promise()
  } catch (e) {
    throw new Error(`could not write to s3 bucket (${process.env.WEB_BUCKET}): ${JSON.stringify(e)}`)
  }

  return {
    statusCode: 200,
    body: indexHTML,
    headers: {
      'content-type': 'text/html'
    }
  }
}
