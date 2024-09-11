/* eslint-disable @typescript-eslint/camelcase */
import { request } from '../request'
import { getFCMTokensForPodcastId } from '~/controllers/fcmDevice'
import { generateAccessToken } from './firebaseGenerateAccessToken'
import { SendNotificationOptions } from './sendNotificationOptions'
import { config } from '~/config';
const fs = require('fs');

const keyFilePath = config.fcmGoogleApiPathToAuthJson;
console.log('keyFilePath', keyFilePath)
const key = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
console.log('key', key)

const fcmGoogleApiPath = `https://fcm.googleapis.com/v1/projects/${key.project_id}/messages:send`
console.log('fcmGoogleApiPath', fcmGoogleApiPath)

export const sendFcmNewEpisodeDetectedNotification = async (options: SendNotificationOptions) => {
  console.log('sendFcmNewEpisodeDetectedNotification', options)
  const { podcastId, podcastShrunkImageUrl, podcastFullImageUrl, episodeFullImageUrl, episodeId } = options
  const fcmTokens = await getFCMTokensForPodcastId(podcastId)
  console.log('sendFcmNewEpisodeDetectedNotification fcmTokens', fcmTokens.length)
  const podcastTitle = options.podcastTitle || 'Untitled Podcast'
  const episodeTitle = options.episodeTitle || 'Untitled Episode'
  const title = podcastTitle
  const body = episodeTitle

  const finalPodcastImageUrl = podcastShrunkImageUrl || podcastFullImageUrl
  const finalEpisodeImageUrl = episodeFullImageUrl

  return sendFCMGoogleApiNotification(
    fcmTokens,
    title,
    body,
    podcastId,
    'new-episode',
    podcastTitle,
    episodeTitle,
    finalPodcastImageUrl,
    finalEpisodeImageUrl,
    episodeId
  )
}

export const sendFcmLiveItemLiveDetectedNotification = async (options: SendNotificationOptions) => {
  console.log('sendFcmLiveItemLiveDetectedNotification', options)
  const { podcastId, podcastShrunkImageUrl, podcastFullImageUrl, episodeFullImageUrl, episodeId } = options
  const fcmTokens = await getFCMTokensForPodcastId(podcastId)
  console.log('sendFcmLiveItemLiveDetectedNotification fcmTokens', fcmTokens.length)
  const podcastTitle = options.podcastTitle || 'Untitled Podcast'
  const episodeTitle = options.episodeTitle || 'Livestream starting'
  const title = `LIVE: ${podcastTitle}`
  const body = episodeTitle

  const finalPodcastImageUrl = podcastShrunkImageUrl || podcastFullImageUrl
  const finalEpisodeImageUrl = episodeFullImageUrl

  return sendFCMGoogleApiNotification(
    fcmTokens,
    title,
    body,
    podcastId,
    'live',
    podcastTitle,
    episodeTitle,
    finalPodcastImageUrl,
    finalEpisodeImageUrl,
    episodeId
  )
}

export const sendFCMGoogleApiNotification = async (
  fcmTokens: string[],
  title: string,
  body: string,
  podcastId: string,
  notificationType: 'live' | 'new-episode',
  podcastTitle: string,
  episodeTitle: string,
  podcastImage?: string,
  episodeImage?: string,
  episodeId?: string
) => {
  console.log('sendFCMGoogleApiNotification', fcmTokens.length, title, podcastId)
  const accessToken = await generateAccessToken()

  if (!fcmTokens || fcmTokens.length === 0) return

  for (const fcmToken of fcmTokens) {
    console.log('fcmToken', fcmToken)
    const imageUrl = episodeImage || podcastImage
    try {
      await request(fcmGoogleApiPath, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: {
          message: {
            token: fcmToken,
            notification: {
              body,
              title,
              image: imageUrl
            },
            data: {
              body,
              title,
              podcastId,
              episodeId,
              podcastTitle: podcastTitle,
              episodeTitle: episodeTitle,
              notificationType,
              timeSent: new Date()
            },
            android: {
              notification: {
                imageUrl
              }
            },
            apns: {
              payload: {
                aps: {
                  'mutable-content': 1
                }
              },
              fcm_options: {
                image: imageUrl
              }
            },
            webpush: {
              headers: {
                image: imageUrl
              }
            }
          }
        },
        json: true
      })
    } catch (error) {
      console.log('sendFCMGoogleApiNotification error', error)
    }
  }
}
