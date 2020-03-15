
import { TwitterSearchResults, TwitterTokenResponse } from './twitter-types'

import * as untracedHttps from 'https'
import * as AWSXRay from 'aws-xray-sdk'
const https = AWSXRay.captureHTTPs(untracedHttps, false)

const buildSearchRequest = (bearerToken: TwitterTokenResponse, sinceId: string | undefined): object => {
  const authHeader = `Bearer ${bearerToken.access_token}`

  const sinceParam = sinceId ? `&since_id=${sinceId}` : ''

  return {
    hostname: 'api.twitter.com',
    port: 443,
    path: `/1.1/search/tweets.json?result_type=recent&q=%23ThisIsMyJam${sinceParam}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Authorization: authHeader
    }
  }
}

export const searchTwitter = (bearerToken: TwitterTokenResponse, sinceId: string | undefined): Promise<TwitterSearchResults> => {
  const options = buildSearchRequest(bearerToken, sinceId)

  return new Promise<TwitterSearchResults>((resolve, reject) => {
    const req = https.request(options, res => {
      let rawData = ''
      res.on('data', (chunk) => (rawData += chunk))

      res.on('end', () => {
        try {
          const parsedData: TwitterSearchResults = JSON.parse(rawData)
          resolve(parsedData)
        } catch (e) {
          reject(e)
        }
      })
    })

    req.on('error', (error) => reject(error))
    req.end()
  })
}
