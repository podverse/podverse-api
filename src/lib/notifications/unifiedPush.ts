/* eslint-disable @typescript-eslint/camelcase */
import { SendNotificationOptions } from './sendNotificationOptions'
import { getUPDevicesForPodcastId } from '~/controllers/upDevice'
import { UPEndpointData } from '~/entities/upDevice'
import { promiseAllSkippingErrors } from '~/lib/utility/promise'

const webpush = require('web-push')

export const sendUpNewEpisodeDetectedNotification = async (options: SendNotificationOptions) => {
  const { podcastId, podcastImage, episodeImage, episodeId } = options
  const upDevices = await getUPDevicesForPodcastId(podcastId)
  const podcastTitle = options.podcastTitle || 'Untitled Podcast'
  const episodeTitle = options.episodeTitle || 'Untitled Episode'
  const title = podcastTitle
  const body = episodeTitle
  return sendUPNotification(
    upDevices,
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

export const sendUpLiveItemLiveDetectedNotification = async (options: SendNotificationOptions) => {
  const { podcastId, podcastImage, episodeImage, episodeId } = options
  const upDevices = await getUPDevicesForPodcastId(podcastId)
  const podcastTitle = options.podcastTitle || 'Untitled Podcast'
  const episodeTitle = options.episodeTitle || 'Livestream starting'
  const title = `LIVE: ${podcastTitle}`
  const body = episodeTitle
  return sendUPNotification(
    upDevices,
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

export const sendUPNotification = async (
  upDevices: UPEndpointData[],
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
  if (!upDevices || upDevices.length === 0) return

  const upDeviceBatches: UPEndpointData[][] = []
  const size = 100
  for (let i = 0; i < upDevices.length; i += size) {
    upDeviceBatches.push(upDevices.slice(i, i + size))
  }

  const data = {
    body,
    title,
    podcastId,
    episodeId,
    podcastTitle: podcastTitle,
    episodeTitle: episodeTitle,
    notificationType,
    timeSent: new Date().toISOString(),
    image: episodeImage || podcastImage
  }
  const jsonPayload = JSON.stringify(data)

  for (const upDeviceBatch of upDeviceBatches) {
    if (upDeviceBatch?.length > 0) {
      try {
        await promiseAllSkippingErrors(
          upDeviceBatch.map((upd: UPEndpointData) =>
            webpush.sendNotification(
              {
                endpoint: upd.upEndpoint,
                keys: {
                  auth: upd.upAuthKey,
                  p256dh: upd.upPublicKey
                }
              },
              jsonPayload
            )
          )
        )
      } catch (error) {
        console.log('sendUPNotification error', error)
      }
    }
  }
}
