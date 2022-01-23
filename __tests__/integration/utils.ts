export const v1Path = '/api/v1'

export const testUsers = {
  freeTrial: {
    authCookie:
      'Authorization=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkVWSERCUlpZIiwiZXhwIjo0Nzg1NDE4NzA4LjYzMSwiaWF0IjoxNjMxODE4NzA4fQ._-qWyLGNoqRawrJal0uQi5u-Oay0UEa43PZOKqL94ys'
  },
  freeTrialExpired: {
    authCookie:
      'Authorization=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJ2VmpzUUNIIiwiZXhwIjo0Nzg1NDE4NzM4LjEzOCwiaWF0IjoxNjMxODE4NzM4fQ.4b_xpW-3iMOK1TaD9xdjNO3mXQP3h9B7Qycy-JLcukg'
  },
  premium: {
    authCookie:
      'Authorization=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlFNUmVKbWJFIiwiZXhwIjo0Nzg1NDE4NzY1LjQ5NSwiaWF0IjoxNjMxODE4NzY1fQ.F4Cmbz7B9lLG1O_t9rB6H7gMUQaP0qQ8Y2_zJp_9-LM'
  },
  premiumExpired: {
    authCookie:
      'Authorization=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im9BYlBQUkY5IiwiZXhwIjo0Nzg1NDE4NzQ5LjAxMSwiaWF0IjoxNjMxODE4NzQ5fQ.QnH9KCQVX_Bwd7-jdGW1XP0GSdbshSfqmNRiJ6IHRyk'
  }
}

export const sampleQueueItem1 = {
  clipEndTime: 1199,
  clipId: 'jxv22OGr',
  clipStartTime: 1114,
  clipTitle: 'Test clip title',
  episodeDescription: 'Test episode description',
  episodeId: 'gRgjd3YcKb',
  episodeImageUrl: 'http://example.com/imageUrl',
  episodeMediaUrl: 'http://example.com/mediaUrl',
  episodePubDate: '2019-01-01T23:54:08.000Z',
  episodeTitle: 'Test episode title',
  isPublic: true,
  ownerId: 'EVHDBRZY',
  ownerIsPublic: true,
  ownerName: 'Free Trial Valid - Test User',
  podcastAuthors: ['Rk1zs7vs'],
  podcastCategories: ['5vNa3RnSZpC'],
  podcastId: '0RMk6UYGq',
  podcastImageUrl: 'http://example.com/imageUrl',
  podcastTitle: 'Test podcast title'
}

export const sampleQueueItem2 = {
  episodeDescription: 'Test episode description 2',
  episodeId: '4s2CiyLsJJ',
  episodeImageUrl: 'http://example.com/imageUrl',
  episodeMediaUrl: 'http://example.com/mediaUrl',
  episodePubDate: '2020-01-01T23:54:08.000Z',
  episodeTitle: 'Test episode title 2',
  isPublic: true,
  ownerId: '',
  ownerIsPublic: null,
  ownerName: '',
  podcastAuthors: ['Rk1zs7vs'],
  podcastCategories: ['5vNa3RnSZpC'],
  podcastId: '0RMk6UYGq',
  podcastImageUrl: 'http://example.com/imageUrl',
  podcastTitle: 'Test podcast title 2'
}

export const sampleQueueItems = [sampleQueueItem1, sampleQueueItem2]
