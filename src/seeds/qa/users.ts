/* eslint-disable @typescript-eslint/camelcase */
import { faker } from '@faker-js/faker'
import { getRepository } from 'typeorm'
import { createUser } from '~/controllers/user'
import { User } from '~/entities'
import { logPerformance, _logEnd, _logStart } from '~/lib/utility'

interface RowExportData {
  email: string
  emailVerificationTokenExpiration: string
  emailVerified: boolean
  freeTrialExpiration: string
  isPublic: boolean
  membershipExpiration: string | null
  name: string
  resetPasswordToken: null
  resetPasswordTokenExpiration: null
  roles: string | string[]
  subscribedPlaylistIds: string | string[]
  subscribedPodcastIds: string | string[]
  subscribedUserIds: string | string[]
  historyItems: string | string[]
  queueItems: string | string[]
  createdAt: string
  updatedAt: string
  addByRSSPodcastFeedUrls: string | string[]
  int_id: number
  userNowPlayingItemId: null
  subscribedPodcastListIds: string | string[]
  isDevAdmin: boolean
  isPodpingAdmin: boolean
}

interface UserEnriched extends RowExportData {
  password: string
  emailVerificationToken: string
}

const insecurePassword = 'Test!1Aa'
export const userFreeTrialValidEmail = 'freetrial@qa.podverse.fm'
export const userFreeTrialExpiredEmail = 'freetrialexpired@qa.podverse.fm'
export const userPremiumValidEmail = 'premium@qa.podverse.fm'
export const userPremiumExpiredEmail = 'premiumexpired@qa.podverse.fm'
export const userQAAdminEmail = 'admin@qa.podverse.fm'
export const userPodpingAdminEmail = 'podpingadmin@qa.podverse.fm'
export const userClipbot9000Email = 'clipbot9000@qa.podverse.fm'
const userClipbot9000Id = 'jISAEEgXa'

export const generateQAUsers = async () => {
  logPerformance('generateQAUsers', _logStart)

  const users = [
    enrichRowExportData(userFreeTrialValid),
    enrichRowExportData(userFreeTrialExpired),
    enrichRowExportData(userPremiumValid),
    enrichRowExportData(userPremiumExpired),
    enrichRowExportData(userQAAdmin),
    enrichRowExportData(userPodpingAdmin),
    enrichRowExportData(userClipbot9000)
  ]

  for (const user of users) {
    await createUser(user)
  }

  // Force userClipbot9000Id to be jISAEEgXa
  // https://github.com/podverse/podverse-api/issues/569
  const clipBot9000User = await getQAUserByEmail(userClipbot9000Email)
  if (clipBot9000User) {
    const clipBot9000UserPreviousId = clipBot9000User.id
    clipBot9000User.id = userClipbot9000Id
    const userRepository = getRepository(User)
    await userRepository.update(clipBot9000UserPreviousId, clipBot9000User)
  }

  logPerformance('generateQAUsers', _logEnd)
}

export const getQAUserByEmail = async (email: string) => {
  const userRepository = getRepository(User)
  return await userRepository.findOne({
    where: { email },
    select: ['id', 'email']
  })
}

const enrichRowExportData = (userLite: RowExportData) => {
  const enrichedUser: UserEnriched = {
    ...userLite,
    password: insecurePassword,
    emailVerificationToken: faker.datatype.uuid(),
    roles: [],
    subscribedPlaylistIds: [],
    subscribedPodcastIds: [],
    subscribedUserIds: [],
    historyItems: [],
    queueItems: [],
    addByRSSPodcastFeedUrls: [],
    subscribedPodcastListIds: []
  }

  return enrichedUser
}

const userFreeTrialValid: RowExportData = {
  email: userFreeTrialValidEmail,
  emailVerificationTokenExpiration: '2023-10-10 22:13:17.764',
  emailVerified: true,
  freeTrialExpiration: '3022-11-09 21:06:37.764',
  isPublic: true,
  membershipExpiration: null,
  name: 'Free Trial - Test Account',
  resetPasswordToken: null,
  resetPasswordTokenExpiration: null,
  roles: '[]',
  subscribedPlaylistIds: '[]',
  subscribedPodcastIds: '[]',
  subscribedUserIds: '[]',
  historyItems: '[]',
  queueItems: '[]',
  createdAt: '2022-10-10 21:06:37.849961',
  updatedAt: '2022-10-10 21:06:37.849961',
  addByRSSPodcastFeedUrls: '[]',
  int_id: 5,
  userNowPlayingItemId: null,
  subscribedPodcastListIds: '[]',
  isDevAdmin: false,
  isPodpingAdmin: false
}

const userFreeTrialExpired: RowExportData = {
  email: userFreeTrialExpiredEmail,
  emailVerificationTokenExpiration: '2023-10-10 22:13:38.999',
  emailVerified: true,
  freeTrialExpiration: '2021-11-09 21:06:58.999',
  isPublic: true,
  membershipExpiration: null,
  name: 'Free Trial Expired - Test Account',
  resetPasswordToken: null,
  resetPasswordTokenExpiration: null,
  roles: '[]',
  subscribedPlaylistIds: '[]',
  subscribedPodcastIds: '[]',
  subscribedUserIds: '[]',
  historyItems: '[]',
  queueItems: '[]',
  createdAt: '2022-10-10 21:06:59.090265',
  updatedAt: '2022-10-10 21:06:59.090265',
  addByRSSPodcastFeedUrls: '[]',
  int_id: 7,
  userNowPlayingItemId: null,
  subscribedPodcastListIds: '[]',
  isDevAdmin: false,
  isPodpingAdmin: false
}

const userPremiumValid: RowExportData = {
  email: userPremiumValidEmail,
  emailVerificationTokenExpiration: '2023-10-10 22:13:11.89',
  emailVerified: true,
  freeTrialExpiration: '2022-11-09 21:06:31.89',
  isPublic: true,
  membershipExpiration: '3022-11-09 21:06:58.999',
  name: 'Premium - Test Account',
  resetPasswordToken: null,
  resetPasswordTokenExpiration: null,
  roles: '[]',
  subscribedPlaylistIds: '[]',
  subscribedPodcastIds: '[]',
  subscribedUserIds: '[]',
  historyItems: '[]',
  queueItems: '[]',
  createdAt: '2022-10-10 21:06:31.968441',
  updatedAt: '2022-10-10 21:06:31.968441',
  addByRSSPodcastFeedUrls: '[]',
  int_id: 4,
  userNowPlayingItemId: null,
  subscribedPodcastListIds: '[]',
  isDevAdmin: false,
  isPodpingAdmin: false
}

const userPremiumExpired: RowExportData = {
  email: userPremiumExpiredEmail,
  emailVerificationTokenExpiration: '2023-10-10 22:13:30.447',
  emailVerified: true,
  freeTrialExpiration: '2022-11-09 21:06:50.448',
  isPublic: true,
  membershipExpiration: '2021-11-09 21:06:58.999',
  name: 'Premium Expired - Test Account',
  resetPasswordToken: null,
  resetPasswordTokenExpiration: null,
  roles: '[]',
  subscribedPlaylistIds: '[]',
  subscribedPodcastIds: '[]',
  subscribedUserIds: '[]',
  historyItems: '[]',
  queueItems: '[]',
  createdAt: '2022-10-10 21:06:50.549761',
  updatedAt: '2022-10-10 21:06:50.549761',
  addByRSSPodcastFeedUrls: '[]',
  int_id: 6,
  userNowPlayingItemId: null,
  subscribedPodcastListIds: '[]',
  isDevAdmin: false,
  isPodpingAdmin: false
}

const userQAAdmin: RowExportData = {
  email: userQAAdminEmail,
  emailVerificationTokenExpiration: '2023-10-10 22:11:40.928',
  emailVerified: true,
  freeTrialExpiration: '2022-11-09 21:05:00.93',
  isPublic: false,
  membershipExpiration: '3022-11-09 21:06:58.999',
  name: 'Admin - Test Account',
  resetPasswordToken: null,
  resetPasswordTokenExpiration: null,
  roles: '[]',
  subscribedPlaylistIds: '[]',
  subscribedPodcastIds: '[]',
  subscribedUserIds: '[]',
  historyItems: '[]',
  queueItems: '[]',
  createdAt: '2022-10-10 21:05:01.189806',
  updatedAt: '2022-10-10 21:05:01.189806',
  addByRSSPodcastFeedUrls: '[]',
  int_id: 1,
  userNowPlayingItemId: null,
  subscribedPodcastListIds: '[]',
  isDevAdmin: true,
  isPodpingAdmin: false
}

const userPodpingAdmin: RowExportData = {
  email: userPodpingAdminEmail,
  emailVerificationTokenExpiration: '2023-10-10 22:11:56.23',
  emailVerified: true,
  freeTrialExpiration: '2022-11-09 21:05:16.23',
  isPublic: false,
  membershipExpiration: '3022-11-09 21:06:58.999',
  name: 'Podping Admin - Test Account',
  resetPasswordToken: null,
  resetPasswordTokenExpiration: null,
  roles: '[]',
  subscribedPlaylistIds: '[]',
  subscribedPodcastIds: '[]',
  subscribedUserIds: '[]',
  historyItems: '[]',
  queueItems: '[]',
  createdAt: '2022-10-10 21:05:16.312309',
  updatedAt: '2022-10-10 21:05:16.312309',
  addByRSSPodcastFeedUrls: '[]',
  int_id: 2,
  userNowPlayingItemId: null,
  subscribedPodcastListIds: '[]',
  isDevAdmin: false,
  isPodpingAdmin: true
}

const userClipbot9000: RowExportData = {
  email: userClipbot9000Email,
  emailVerificationTokenExpiration: '2023-10-10 22:12:41.631',
  emailVerified: true,
  freeTrialExpiration: '2022-11-09 21:06:01.631',
  isPublic: false,
  membershipExpiration: '3022-11-09 21:06:58.999',
  name: 'Clip Bot - Test Account',
  resetPasswordToken: null,
  resetPasswordTokenExpiration: null,
  roles: '[]',
  subscribedPlaylistIds: '[]',
  subscribedPodcastIds: '[]',
  subscribedUserIds: '[]',
  historyItems: '[]',
  queueItems: '[]',
  createdAt: '2022-10-10 21:06:01.714927',
  updatedAt: '2022-10-10 21:06:01.714927',
  addByRSSPodcastFeedUrls: '[]',
  int_id: 3,
  userNowPlayingItemId: null,
  subscribedPodcastListIds: '[]',
  isDevAdmin: false,
  isPodpingAdmin: false
}
