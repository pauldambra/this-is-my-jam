import * as templates from './templates'

import * as AWSXRay from 'aws-xray-sdk'
import * as untracedAWSSDK from 'aws-sdk'
import { sortToots } from '../poll-for-jams/last-stored-toot'

const AWS = AWSXRay.captureAWS(untracedAWSSDK)

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })
const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

module.exports.generate = async (event): Promise<object> => {
  if (!process.env.TOOT_TABLE_NAME || !process.env.WEB_BUCKET) {
    console.log(`must provide env variables:
    toot table: ${process.env.TOOT_TABLE_NAME}
    web bucket: ${process.env.WEB_BUCKET}`)
    return {
      statusCode: 400
    }
  }

  const { Items } = await docClient.scan({
    TableName: process.env.TOOT_TABLE_NAME
  }).promise()

  const byDate = sortToots(Items)

  const indexHTML = templates.htmlPage(byDate[0])

  try {
    const uploadParams = {
      Bucket: process.env.WEB_BUCKET,
      Key: 'index.html',
      ContentType: 'binary',
      Body: Buffer.from(indexHTML, 'binary')
    }

    await s3.putObject(uploadParams).promise()
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
