/* eslint-disable @typescript-eslint/camelcase */
import { request } from '../request'
import { config } from '~/config'
import { getFCMTokensForPodcastId } from '~/controllers/fcmDevice'
const { fcmGoogleApiAuthToken } = config

const fcmGoogleApiPath = 'https://fcm.googleapis.com/fcm/send'

export const sendNewEpisodeDetectedNotification = async (
  podcastId: string,
  podcastTitle?: string,
  episodeTitle?: string
) => {
  const fcmTokens = await getFCMTokensForPodcastId(podcastId)
  const title = podcastTitle || 'Untitled Podcast'
  const body = episodeTitle || 'Untitled Episode'
  return sendFCMGoogleApiNotification(fcmTokens, title, body, podcastId, 'new-episode')
}

export const sendLiveItemLiveDetectedNotification = async (
  podcastId: string,
  podcastTitle?: string,
  episodeTitle?: string
) => {
  const fcmTokens = await getFCMTokensForPodcastId(podcastId)
  const title = `LIVE: ${podcastTitle || 'Untitled Podcast'}`
  const body = episodeTitle || 'Untitled Episode'
  return sendFCMGoogleApiNotification(fcmTokens, title, body, podcastId, 'live')
}

export const sendFCMGoogleApiNotification = async (
  fcmTokens: string[],
  title: string,
  body: string,
  podcastId: string,
  notificationType: 'live' | 'new-episode'
) => {
  return request(fcmGoogleApiPath, {
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
        notificationType
      },
      data: {
        body,
        title,
        podcastId,
        notificationType
      }
    },
    json: true
  })
}
