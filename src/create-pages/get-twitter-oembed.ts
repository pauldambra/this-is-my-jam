import * as untracedHttps from 'https'

import {TootHTML} from '../twitter-api/twitter-types'

import * as AWSXRay from 'aws-xray-sdk'

const https = AWSXRay.captureHTTPs(untracedHttps, false)

const buildRequest = (tootUser: string, tootID: string): object => {
  return {
    hostname: 'publish.twitter.com',
    port: 443,
    path: `/oembed?url=https%3A%2F%2Ftwitter.com%2F${tootUser}%2Fstatus%2F${tootID}&dnt=true`,
    method: 'GET',
    headers: {}
  }
}

export const oEmbedHTML = (tootUser: string, tootId: string): Promise<TootHTML> => {
  const options = buildRequest(tootUser, tootId)

  console.log(options, 'options for oembed')

  return new Promise<TootHTML>((resolve, reject) => {
    const req = https.request(options, (res): void => {
      res.setEncoding('utf8')
      let rawData = ''
      res.on('data', (chunk) => (rawData += chunk))

      res.on('end', () => {
        try {
          console.log(rawData, 'before parseing oembed')
          const parsedData: TootHTML = JSON.parse(rawData)
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
