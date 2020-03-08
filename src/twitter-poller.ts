import { getBearerToken, TwitterTokenResponse } from './twitter-api/get-twitter-bearer-token'
import { searchTwitter, Toot } from './twitter-api/search-twitter'

import * as AWSXRay from 'aws-xray-sdk'
import * as untracedAWSSDK from 'aws-sdk'
import { getLastTootStored, setLastTootStored } from './last-stored-toot'

const AWS = AWSXRay.captureAWS(untracedAWSSDK)

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })

export interface TwitterAccessKeys {
  key: string;
  secretKey: string;
}

const noKeyAvailable = { key: 'no-key', secretKey: 'no-key' }

const getTwitterAccessKey = (): TwitterAccessKeys => process.env.TWITTER_ACCESS ? JSON.parse(process.env.TWITTER_ACCESS) : noKeyAvailable
let bearerToken: TwitterTokenResponse
let twitterAccess: TwitterAccessKeys

export const handle = async (): Promise<void> => {
  twitterAccess = twitterAccess || getTwitterAccessKey()
  bearerToken = bearerToken || await getBearerToken(twitterAccess)

  const sinceId: number | undefined = await getLastTootStored(
    process.env.LAST_TOOT_TABLE_NAME,
    docClient,
    process.env.LAST_TOOT_ID)

  const searchResults = await searchTwitter(bearerToken, sinceId)
  console.log(`loaded ${searchResults.statuses.length} toots`)

  try {
    const toSave = searchResults.statuses.map(s => {
      return {
        id: s.id,
        timestamp: new Date(s.created_at).toISOString(),
        toot: JSON.stringify(s)
      }
    })

    const writes = toSave
      .map(async ts => {
        return docClient.put({
          TableName: process.env.TOOT_TABLE_NAME,
          Item: ts
        }).promise()
      })

    await Promise.all(writes)

    await setLastTootStored(
      process.env.LAST_TOOT_TABLE_NAME,
      docClient,
      process.env.LAST_TOOT_ID,
      toSave)
  } catch (e) {
    console.error(e)
  }
}
