import * as untracedHttps from 'https'

import { TwitterAccessKeys } from '../twitter-poller'

import * as AWSXRay from 'aws-xray-sdk'
const https = AWSXRay.captureHTTPs(untracedHttps, false)

export interface TwitterTokenResponse {
    token_type: 'bearer';
    access_token: string;
}

const buildRequest = (twitterAccess: TwitterAccessKeys): [string, object] => {
  const k = encodeURIComponent(twitterAccess.key)
  const sk = encodeURIComponent(twitterAccess.secretKey)
  const encodedToken = Buffer.from(`${k}:${sk}`).toString('base64')
  const authHeader = `Basic ${encodedToken}`
  const data = 'grant_type=client_credentials'

  const options = {
    hostname: 'api.twitter.com',
    port: 443,
    path: '/oauth2/token?grant_type=client_credentials',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Content-Length': data.length,
      Authorization: authHeader
    }
  }
  return [data, options]
}

const processResponse = (
  resolve: (value?: (PromiseLike<TwitterTokenResponse> | TwitterTokenResponse)) => void,
  reject: (reason?: Error) => void) => (res): void => {
  res.setEncoding('utf8')
  let rawData = ''
  res.on('data', (chunk) => (rawData += chunk))

  res.on('end', () => {
    try {
      const parsedData: TwitterTokenResponse = JSON.parse(rawData)
      resolve(parsedData)
    } catch (e) {
      reject(e)
    }
  })
}

export const getBearerToken = (twitterAccess: TwitterAccessKeys): Promise<TwitterTokenResponse> => {
  const [data, options] = buildRequest(twitterAccess)

  return new Promise<TwitterTokenResponse>((resolve, reject) => {
    const req = https.request(options, processResponse(resolve, reject))

    req.on('error', (error) => reject(error))

    req.write(data)
    req.end()
  })
}
