import { SendNotificationOptions } from "./sendNotificationOptions"
import { sendFcmLiveItemLiveDetectedNotification, sendFcmNewEpisodeDetectedNotification } from "./fcmGoogleApi"
import { sendUpLiveItemLiveDetectedNotification, sendUpNewEpisodeDetectedNotification } from "./unifiedPush"


export const sendNewEpisodeDetectedNotification = async (
  options: SendNotificationOptions
) => {
  return Promise.all([
    sendFcmNewEpisodeDetectedNotification(options),
    sendUpNewEpisodeDetectedNotification(options)
  ])
}

export const sendLiveItemLiveDetectedNotification = async (
  options: SendNotificationOptions
) => {
  return Promise.all([
    sendFcmLiveItemLiveDetectedNotification(options),
    sendUpLiveItemLiveDetectedNotification(options)
  ])
}