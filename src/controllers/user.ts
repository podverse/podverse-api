import { hash } from 'bcryptjs'
import { getRepository } from 'typeorm'
import { getFeedUrlByUrlIgnoreProtocol } from '~/controllers/feedUrl'
import { getPlaylists } from '~/controllers/playlist'
import { subscribeToPodcast } from '~/controllers/podcast'
import { MediaRef, Playlist, User } from '~/entities'
import { saltRounds } from '~/lib/constants'
import { validateClassOrThrow } from '~/lib/errors'
import { addOrderByToQuery, validatePassword } from '~/lib/utility'
import { validateEmail } from '~/lib/utility/validation'

const createError = require('http-errors')

const addYearsToUserMembershipExpiration = async (id: string, years: number) => {
  const user = await getUser(id)
  if (user) {
    const { freeTrialExpiration } = user
    let { membershipExpiration } = user
    const currentDate = new Date()

    if (!membershipExpiration) {
      membershipExpiration = currentDate
    }

    if (freeTrialExpiration) {
      const freeTrialTimeRemaining = freeTrialExpiration.getTime() - currentDate.getTime()
      if (freeTrialTimeRemaining > 0) {
        membershipExpiration = new Date(membershipExpiration.getTime() + freeTrialTimeRemaining)
      }
    }

    // eslint-disable-next-line
    // @ts-ignore
    user.freeTrialExpiration = null
    const yearsInMilliseconds = years * 365 * 24 * 60 * 60 * 1000
    user.membershipExpiration = new Date(membershipExpiration.getTime() + yearsInMilliseconds)

    const repository = getRepository(User)
    await repository.update(user.id, user)

    return {
      id: user.id,
      membershipExpiration: user.membershipExpiration
    }
  } else {
    throw new createError.NotFound('User not found.')
  }
}

const getUser = async (id: string) => {
  const repository = getRepository(User)
  
  const user = await repository.findOne(
    { id },
    {
      relations: [],
      select: ['id', 'freeTrialExpiration', 'membershipExpiration']
    }
  )

  if (!user) {
    throw new createError.NotFound('User not found')
  }

  return user
}

const createUser = async (obj) => {
  const repository = getRepository(User)
  const user = new User()
  const { password } = obj

  const isValidPassword = validatePassword(password)

  if (!isValidPassword) {
    throw new createError.BadRequest('Invalid password provided.')
  }

  const saltedPassword = await hash(password, saltRounds)

  /*
    queueItems and historyItems are legacy columns that no longer exist on user object.
    Set these to an empty array to avoid "column violates not-null constraint" error.
  */
  obj.queueItems = []
  obj.historyItems = []

  obj.addByRSSPodcastFeedUrls = Array.isArray(obj.addByRSSPodcastFeedUrls) ? obj.addByRSSPodcastFeedUrls : []
  obj.subscribedPlaylistIds = Array.isArray(obj.subscribedPlaylistIds) ? obj.subscribedPlaylistIds : []
  obj.subscribedPodcastIds = Array.isArray(obj.subscribedPodcastIds) ? obj.subscribedPodcastIds : []
  obj.subscribedUserIds = Array.isArray(obj.subscribedUserIds) ? obj.subscribedUserIds : []

  const newUser = Object.assign(user, obj, { password: saltedPassword })

  await validateClassOrThrow(newUser)

  await repository.save(newUser)
  return newUser
}

const deleteLoggedInUser = async (id, loggedInUserId) => {

  if (id !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to delete this user')
  }

  const repository = getRepository(User)
  const user = await repository.findOne({ id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  const result = await repository.remove(user)
  return result
}

const getLoggedInUser = async id => {
  const repository = getRepository(User)

  const qb = repository
    .createQueryBuilder('user')
    .select('user.id')
    .addSelect('user.addByRSSPodcastFeedUrls')
    .addSelect('user.email')
    .addSelect('user.emailVerified')
    .addSelect('user.freeTrialExpiration')
    .addSelect('user.isPublic')
    .addSelect('user.membershipExpiration')
    .addSelect('user.name')
    .addSelect('user.subscribedPlaylistIds')
    .addSelect('user.subscribedPodcastIds')
    .addSelect('user.subscribedUserIds')
    .leftJoinAndSelect(
      'user.playlists',
      'playlists',
      'playlists.owner = :ownerId',
      {
        ownerId: id
      }
    )
    .where('user.id = :id', { id })

  try {
    const user = await qb.getOne()

    if (!user) {
      throw new createError.NotFound('User not found.')
    }

    return user
  } catch (error) {
    console.log(error)
    return
  }
}

const getPublicUser = async id => {
  const repository = getRepository(User)

  const qb = repository
    .createQueryBuilder('user')
    .select('user.id')
    .addSelect('user.name')
    .addSelect('user.subscribedPodcastIds')
    .addSelect('user.isPublic')
    .where({ isPublic: true })
    .andWhere('user.id = :id', { id })

  const user = await qb.getOne()

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  return user
}

const getPublicUsers = async query => {
  const repository = getRepository(User)
  const { skip, take } = query
  const userIds = query.userIds && query.userIds.split(',') || []

  if (!userIds || userIds.length < 1) {
    return [[], 0]
  }

  const users = await repository
    .createQueryBuilder('user')
    .select('user.id')
    .addSelect('user.name')
    .where({
      isPublic: true
    })
    .andWhere('user.id IN (:...userIds)', { userIds })
    .skip(skip)
    .take(take)
    .orderBy('user.name', 'ASC')
    .getManyAndCount()

  return users
}

const getSubscribedPublicUsers = async (query, loggedInUserId) => {
  const subscribedPublicUserIds = await getUserSubscribedPublicUserIds(loggedInUserId)
  query.userIds = subscribedPublicUserIds.join(',')
  return getPublicUsers(query)
}

const getUserSingleField = async (id, field) => {
  const repository = getRepository(User)

  const user = await repository
    .createQueryBuilder('user')
    .select('user.id')
    .addSelect(`user.${field}`)
    .where({ id })
    .getOne()

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  return user[field]
}

const getUserSubscribedPlaylistIds = async id => {
  return getUserSingleField(id, 'subscribedPlaylistIds')
}

const getUserSubscribedPodcastIds = async id => {
  return getUserSingleField(id, 'subscribedPodcastIds')
}

const getUserSubscribedPublicUserIds = async id => {
  return getUserSingleField(id, 'subscribedUserIds')
}

const getUserMediaRefs = async (query, ownerId, includeNSFW, includePrivate) => {
  const { skip, sort, take } = query
  const repository = getRepository(MediaRef)
  const episodeJoinAndSelect = `${includeNSFW ? 'true' : 'episode.isExplicit = :isExplicit'}`

  let qb = await repository
    .createQueryBuilder('mediaRef')
    .innerJoinAndSelect(
      'mediaRef.episode',
      'episode',
      episodeJoinAndSelect,
      {
        isExplicit: !!includeNSFW
      }
    )
    .innerJoinAndSelect('episode.podcast', 'podcast')
    .where(
      {
        ...(includePrivate ? {} : { isPublic: true }),
        owner: ownerId
      }
    )
    .skip(skip)
    .take(take)

  const allowRandom = true
  qb = addOrderByToQuery(qb, 'mediaRef', sort, 'createdAt', allowRandom)
    
  const results = await qb.getManyAndCount()

  return results
}

const getLoggedInUserPlaylistsCombined = async (loggedInUserId) => {
  const repository = getRepository(Playlist)

  const loggedInUserCreatedPlaylists = await repository
    .createQueryBuilder('playlist')
    .select('playlist.id')
    .addSelect('playlist.description')
    .addSelect('playlist.isPublic')
    .addSelect('playlist.itemCount')
    .addSelect('playlist.itemsOrder')
    .addSelect('playlist.title')
    .addSelect('playlist.createdAt')
    .addSelect('playlist.updatedAt')
    .innerJoin('playlist.owner', 'user')
    .addSelect('user.id')
    .addSelect('user.name')
    .where({ owner: loggedInUserId })
    .orderBy('playlist.title', 'ASC')
    .getMany()

  const loggedInUser = await getLoggedInUser(loggedInUserId)

  if (!loggedInUser) {
    throw new createError.NotFound('User not found.')
  }

  const { subscribedPlaylistIds } = loggedInUser
  const subscribedPlaylistIdsString = subscribedPlaylistIds.join(',')
  const loggedInUserSubscribedPlaylists = await getPlaylists({ playlistId: subscribedPlaylistIdsString })

  return {
    createdPlaylists: loggedInUserCreatedPlaylists,
    subscribedPlaylists: loggedInUserSubscribedPlaylists
  }
}

const getUserPlaylists = async (query, ownerId) => {
  const { skip, take } = query
  const repository = getRepository(Playlist)

  const playlists = await repository
    .createQueryBuilder('playlist')
    .select('playlist.id')
    .addSelect('playlist.description')
    .addSelect('playlist.isPublic')
    .addSelect('playlist.itemCount')
    .addSelect('playlist.itemsOrder')
    .addSelect('playlist.title')
    .addSelect('playlist.createdAt')
    .addSelect('playlist.updatedAt')
    .innerJoin('playlist.owner', 'user')
    .addSelect('user.id')
    .where({ owner: ownerId })
    .skip(skip)
    .take(take)
    .orderBy('playlist.title', 'ASC')
    .getManyAndCount()

  return playlists
}

const getUserByEmail = async (email) => {
  const repository = getRepository(User)
  const user = await repository.findOne({
    where: { email },
    select: [
      'emailVerified',
      'id',
      'name'
    ]
  })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  return user
}

const getUserByResetPasswordToken = async (resetPasswordToken) => {
  if (!resetPasswordToken) {
    throw new createError.BadRequest('Must provide a reset password token.')
  }

  const repository = getRepository(User)
  const user = await repository.findOne({ resetPasswordToken })

  if (!user) {
    throw new createError.BadRequest('Invalid password reset token.')
  }

  return user
}

const getUserByVerificationToken = async (emailVerificationToken) => {
  if (!emailVerificationToken) {
    throw new createError.BadRequest('Must provide an email verification token.')
  }

  const repository = getRepository(User)
  const user = await repository.findOne(
    {
      where: { emailVerificationToken },
      select: [
        'emailVerificationToken',
        'emailVerificationTokenExpiration',
        'emailVerified',
        'id'
      ]
    }
  )

  if (!user) {
    throw new createError.NotFound('Invalid verify email token.')
  }

  return user
}

const toggleSubscribeToUser = async (userId, loggedInUserId) => {

  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to subscribe to this profile.')
  }

  const repository = getRepository(User)
  const loggedInUser = await repository.findOne(
    {
      where: {
        id: loggedInUserId
      },
      select: [
        'id',
        'subscribedUserIds'
      ]
    }
  )

  if (!loggedInUser) {
    throw new createError.NotFound('Logged In user not found')
  }

  const userToSubscribe = await repository.findOne(
    {
      where: {
        id: userId
      },
      select: [
        'id',
        'subscribedUserIds'
      ]
    }
  )

  if (!userToSubscribe) {
    throw new createError.NotFound('User not found')
  }

  let subscribedUserIds = loggedInUser.subscribedUserIds

  // If no userIds match the filter, add the userId.
  // Else, remove the userId.
  const filteredUsers = loggedInUser.subscribedUserIds.filter(x => x !== userId)
  if (filteredUsers.length === loggedInUser.subscribedUserIds.length) {
    subscribedUserIds.push(userId)
  } else {
    subscribedUserIds = filteredUsers
  }

  await repository
    .createQueryBuilder()
    .update(User)
    .set({ subscribedUserIds })
    .where('id = :loggedInUserId', { loggedInUserId })
    .execute()

  return subscribedUserIds
}

const updateLoggedInUser = async (obj, loggedInUserId) => {

  if (!obj.id) {
    throw new createError.NotFound('Must provide a user id.')
  }

  if (obj.id !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to update this user.')
  }

  if (obj.email && !validateEmail(obj.email)) {
    throw new createError.BadRequest('Please provide a valid email address.')
  }

  const repository = getRepository(User)
  const user = await repository.findOne({ id: obj.id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  const cleanedObj = {
    ...(obj.email ? { email: obj.email } : {}),
    ...(obj.isPublic || obj.isPublic === false ? { isPublic: obj.isPublic } : {}),
    ...(obj.name || obj.name === '' ? { name: obj.name } : {})
  }

  await repository.update(obj.id, cleanedObj)

  return {
    email: obj.email,
    id: obj.id,
    isPublic: obj.isPublic,
    name: obj.name
  }
}

const updateUserEmailVerificationToken = async obj => {
  const repository = getRepository(User)
  const user = await repository.findOne({ id: obj.id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  const { emailVerified, emailVerificationToken, emailVerificationTokenExpiration } = obj

  const cleanedObj = {
    ...(emailVerified ? { emailVerified } : {}),
    ...(emailVerificationToken ? { emailVerificationToken } : {}),
    ...(emailVerificationTokenExpiration ? { emailVerificationTokenExpiration } : {})
  }

  await repository.update(obj.id, cleanedObj)

  return
}

const updateUserPassword = async obj => {
  const repository = getRepository(User)
  const user = await repository.findOne({ id: obj.id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  const { password, resetPasswordToken, resetPasswordTokenExpiration } = obj

  if (!password) {
    throw new createError.BadRequest('Must provide a new password.')
  } else if (password && !validatePassword(password)) {
    throw new createError.BadRequest('Invalid password provided.')
  }

  const saltedPassword = await hash(password, saltRounds)

  const cleanedObj = {
    password: saltedPassword,
    resetPasswordToken,
    resetPasswordTokenExpiration
  }

  const newUser = Object.assign(user, cleanedObj)

  await repository.update(obj.id, cleanedObj)

  return newUser
}

const updateUserResetPasswordToken = async (obj) => {
  const repository = getRepository(User)
  const user = await repository.findOne({ id: obj.id })

  if (!user) {
    throw new createError.NotFound('User not found.')
  }

  const cleanedObj = {
    resetPasswordToken: obj.resetPasswordToken,
    resetPasswordTokenExpiration: obj.resetPasswordTokenExpiration
  }

  const newUser = Object.assign(user, cleanedObj)

  await repository.update(obj.id, cleanedObj)

  return newUser
}

const getCompleteUserDataAsJSON = async (id, loggedInUserId) => {

  if (id !== loggedInUserId) {
    throw new createError.Unauthorized(`Unauthorized error. Please check that you are logged in.`)
  }
  const userRepository = getRepository(User)

  const user = await userRepository.findOne(
    {
      id: loggedInUserId
    },
    {
      select: [
        'id',
        'addByRSSPodcastFeedUrls',
        'email',
        'name',
        'subscribedPlaylistIds',
        'subscribedPodcastIds',
        'subscribedUserIds'
      ],
      relations: ['mediaRefs', 'playlists']
    }
  )

  return JSON.stringify(user)
}

const addByRSSPodcastFeedUrlAddMany = async (urls: string[], loggedInUserId: string) => {
  let addByRSSPodcastFeedUrls = []
  for (const url of urls) {
    addByRSSPodcastFeedUrls = await addByRSSPodcastFeedUrlAdd(url, loggedInUserId) as any
  }

  const subscribedPodcastIds = await getUserSubscribedPodcastIds(loggedInUserId)

  return {
    addByRSSPodcastFeedUrls,
    subscribedPodcastIds
  }
}

const addByRSSPodcastFeedUrlAdd = async (url: string, loggedInUserId: string) => {
  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to subscribe to this profile.')
  }

  const repository = getRepository(User)
  const loggedInUser = await repository.findOne(
    {
      where: {
        id: loggedInUserId
      },
      select: [
        'id',
        'addByRSSPodcastFeedUrls'
      ]
    }
  )

  if (!loggedInUser) {
    throw new createError.NotFound('Logged In user not found')
  }

  const skipNotFound = true
  const existingFeedUrl = await getFeedUrlByUrlIgnoreProtocol(url, skipNotFound)
  const addByRSSPodcastFeedUrls = loggedInUser.addByRSSPodcastFeedUrls

  if (existingFeedUrl) {
    await subscribeToPodcast(existingFeedUrl.podcast.id, loggedInUserId)
  } else {  
    const filteredAddByRSSPodcastFeedUrls = loggedInUser.addByRSSPodcastFeedUrls.filter(x => x !== url)
    if (filteredAddByRSSPodcastFeedUrls.length === loggedInUser.addByRSSPodcastFeedUrls.length) {
      addByRSSPodcastFeedUrls.push(url)
    }
  
    await repository
      .createQueryBuilder()
      .update(User)
      .set({ addByRSSPodcastFeedUrls })
      .where('id = :loggedInUserId', { loggedInUserId })
      .execute()
  }
    
  return addByRSSPodcastFeedUrls
}

const addByRSSPodcastFeedUrlRemove = async (url: string, loggedInUserId: string) => {
  if (!loggedInUserId) {
    throw new createError.Unauthorized('Log in to subscribe to this profile.')
  }

  const repository = getRepository(User)
  const loggedInUser = await repository.findOne(
    {
      where: {
        id: loggedInUserId
      },
      select: [
        'id',
        'addByRSSPodcastFeedUrls'
      ]
    }
  )

  if (!loggedInUser) {
    throw new createError.NotFound('Logged In user not found')
  }

  let addByRSSPodcastFeedUrls = loggedInUser.addByRSSPodcastFeedUrls

  const filteredAddByRSSPodcastFeedUrls = loggedInUser.addByRSSPodcastFeedUrls.filter(x => x !== url)
  addByRSSPodcastFeedUrls = filteredAddByRSSPodcastFeedUrls

  await repository
    .createQueryBuilder()
    .update(User)
    .set({ addByRSSPodcastFeedUrls })
    .where('id = :loggedInUserId', { loggedInUserId })
    .execute()

  return addByRSSPodcastFeedUrls
}

export {
  addByRSSPodcastFeedUrlAdd,
  addByRSSPodcastFeedUrlAddMany,
  addByRSSPodcastFeedUrlRemove,
  addYearsToUserMembershipExpiration,
  createUser,
  deleteLoggedInUser,
  getCompleteUserDataAsJSON,
  getLoggedInUser,
  getLoggedInUserPlaylistsCombined,
  getPublicUser,
  getPublicUsers,
  getUserByEmail,
  getUserByResetPasswordToken,
  getUserByVerificationToken,
  getUserMediaRefs,
  getUserPlaylists,
  getUserSubscribedPlaylistIds,
  getUserSubscribedPodcastIds,
  getSubscribedPublicUsers,
  toggleSubscribeToUser,
  updateLoggedInUser,
  updateUserEmailVerificationToken,
  updateUserPassword,
  updateUserResetPasswordToken
}
