import * as untracedHttps from 'https'

import { TwitterTokenResponse } from './get-twitter-bearer-token'

import * as AWSXRay from 'aws-xray-sdk'
const https = AWSXRay.captureHTTPs(untracedHttps, false)

// full schema at https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/intro-to-tweet-json
export interface Toot {
  'created_at': string;
  'id': number;
  'text': string;
  'truncated': boolean;
}

export interface TwitterSearchResults {
  statuses: Array<Toot>;
  search_metadata: object;
}

const buildSearchRequest = (bearerToken: TwitterTokenResponse, sinceId: number): object => {
  const authHeader = `Bearer ${bearerToken.access_token}`

  const sinceParam = sinceId ? `&since_id=${sinceId}` : ''

  // will eventually have since_id parameter to page from last toot processed
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

export const searchTwitter = (bearerToken: TwitterTokenResponse, sinceId: number): Promise<TwitterSearchResults> => {
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
