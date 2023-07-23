/* eslint-disable @typescript-eslint/camelcase */
import { request } from '../request'
import { config } from '~/config'
import { getFCMTokensForPodcastId } from '~/controllers/fcmDevice'
import { SendNotificationOptions } from './sendNotificationOptions'
const { fcmGoogleApiAuthToken } = config

const fcmGoogleApiPath = 'https://fcm.googleapis.com/fcm/send'

export const sendFcmNewEpisodeDetectedNotification = async (
  options: SendNotificationOptions
) => {
  const { podcastId, podcastImage, episodeImage, episodeId } = options
  const fcmTokens = await getFCMTokensForPodcastId(podcastId)
  const podcastTitle = options.podcastTitle || 'Untitled Podcast'
  const episodeTitle = options.episodeTitle || 'Untitled Episode'
  const title = podcastTitle
  const body = episodeTitle
  return sendFCMGoogleApiNotification(
    fcmTokens,
    title,
    body,
    podcastId,
    'new-episode',
    podcastTitle,
    episodeTitle,
    podcastImage,
    episodeImage,
    episodeId
  )
}

export const sendFcmLiveItemLiveDetectedNotification = async (
  options: SendNotificationOptions
) => {
  const { podcastId, podcastImage, episodeImage, episodeId } = options
  const fcmTokens = await getFCMTokensForPodcastId(podcastId)
  const podcastTitle = options.podcastTitle || 'Untitled Podcast'
  const episodeTitle = options.episodeTitle || 'Livestream starting'
  const title = `LIVE: ${podcastTitle}`
  const body = episodeTitle
  return sendFCMGoogleApiNotification(
    fcmTokens,
    title,
    body,
    podcastId,
    'live',
    podcastTitle,
    episodeTitle,
    podcastImage,
    episodeImage,
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
  if (!fcmTokens || fcmTokens.length === 0) return

  const fcmTokenBatches: any[] = []
  const size = 1000
  for (let i = 0; i < fcmTokens.length; i += size) {
    fcmTokenBatches.push(fcmTokens.slice(i, i + size))
  }

  for (const fcmTokenBatch of fcmTokenBatches) {
    if (fcmTokenBatch?.length > 0) {
      const imageUrl = episodeImage || podcastImage

      try {
        await request(fcmGoogleApiPath, {
          method: 'POST',
          headers: {
            Authorization: `key=${fcmGoogleApiAuthToken}`,
            'Content-Type': 'application/json'
          },
          body: {
            registration_ids: fcmTokenBatch || [],
            notification: {
              body,
              title,
              podcastId,
              episodeId,
              podcastTitle: podcastTitle,
              episodeTitle: episodeTitle,
              notificationType,
              timeSent: new Date(),
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
          },
          json: true
        })
      } catch (error) {
        console.log('sendFCMGoogleApiNotification error', error)
      }
    }
  }
}
