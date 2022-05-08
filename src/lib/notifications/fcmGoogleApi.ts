/* eslint-disable @typescript-eslint/camelcase */
import { request } from 'request'
import { config } from '~/config'
const { fcmGoogleApiAuthToken } = config

const fcmGoogleApiPath = 'https://fcm.googleapis.com/fcm/send'

export const sendFCMGoogleApiNotification = async (fcmTokens: string[], body: string, title: string) => {
  const fcmTokensString = fcmTokens.join()
  return request({
    method: 'POST',
    uri: fcmGoogleApiPath,
    headers: {
      Authorization: `key=${fcmGoogleApiAuthToken}`,
      'Content-Type': 'application/json'
    },
    body: {
      registration_ids: fcmTokensString,
      notification: {
        body,
        title
      },
      data: {
        body,
        title
      }
    },
    json: true
  })
}
