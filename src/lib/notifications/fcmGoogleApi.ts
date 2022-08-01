/* eslint-disable @typescript-eslint/camelcase */
import { request } from '../request'
import { config } from '~/config'
import { getFCMTokensForPodcastId } from '~/controllers/fcmDevice'
const { fcmGoogleApiAuthToken } = config

const fcmGoogleApiPath = 'https://fcm.googleapis.com/fcm/send'

export const sendNewEpisodeDetectedNotification = async (
  podcastId: string,
  podcastTitle?: string,
  episodeTitle?: string,
  podcastImage?: string,
  episodeImage?: string,
  episodeId?: string
) => {
  const fcmTokens = await getFCMTokensForPodcastId(podcastId)
  podcastTitle = podcastTitle || 'Untitled Podcast'
  episodeTitle = episodeTitle || 'Untitled Episode'
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

export const sendLiveItemLiveDetectedNotification = async (
  podcastId: string,
  podcastTitle?: string,
  episodeTitle?: string,
  podcastImage?: string,
  episodeImage?: string,
  episodeId?: string
) => {
  const fcmTokens = await getFCMTokensForPodcastId(podcastId)
  podcastTitle = podcastTitle || 'Untitled Podcast'
  episodeTitle = episodeTitle || 'Livestream starting'
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
  if (fcmTokens?.length > 0) {
    const imageUrl = episodeImage || podcastImage

    request(fcmGoogleApiPath, {
      method: 'POST',
      headers: {
        Authorization: `key=${fcmGoogleApiAuthToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        registration_ids: fcmTokens || [],
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
  }
}
