export const v1Path = '/api/v1'

export const testUsers = {
  freeTrial: {
    authCookie: 'Authorization=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkVWSERCUlpZIiwiZXhwIjoxNjI5NTE5NjM0LjQxMSwiaWF0IjoxNTk3OTgzNjM0fQ.5urqOHN-rrKC91fChGFZZqjVgCM3koJVWa-acGcYDXI'
  },
  freeTrialExpired: {
    authCookie: 'Authorization=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJ2VmpzUUNIIiwiZXhwIjoxNjI5NTE5NjQ4LjA3NSwiaWF0IjoxNTk3OTgzNjQ4fQ.INjkM-oI4V2OCQhZH76eumQrHSyku2352t3rnc6o2ZE'
  },
  premium: {
    authCookie: 'Authorization=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlFNUmVKbWJFIiwiZXhwIjoxNjI5NTE4MjIxLjYwMywiaWF0IjoxNTk3OTgyMjIxfQ.BXiXGynXbvJyubx_t9n2uHxV8evuE_bzEy9yahi-wdI'
  },
  premiumExpired: {
    authCookie: 'Authorization=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im9BYlBQUkY5IiwiZXhwIjoxNjI5NTE5NjA0LjkwMSwiaWF0IjoxNTk3OTgzNjA0fQ.2RmV5Py8cUR-ckkqus262fMv-3MJNxM1EmIRLun0k3o'
  }
}

export const sampleQueueItem = {
  'clipEndTime': 1199,
  'clipId': 'jxv22OGr',
  'clipStartTime': 1114,
  'clipTitle': 'Test clip title',
  'episodeDescription': 'Test episode description',
  'episodeId': 'gRgjd3YcKb',
  'episodeImageUrl': 'http://example.com/imageUrl',
  'episodeMediaUrl': 'http://example.com/mediaUrl',
  'episodePubDate': '2019-01-01T23:54:08.000Z',
  'episodeTitle': 'Test episode title',
  'isPublic': true,
  'ownerId': 'EVHDBRZY',
  'ownerIsPublic': true,
  'ownerName': 'Free Trial Valid - Test User',
  'podcastAuthors': ['Rk1zs7vs'],
  'podcastCategories': ['5vNa3RnSZpC'],
  'podcastId': '0RMk6UYGq',
  'podcastImageUrl': 'http://example.com/imageUrl',
  'podcastTitle': 'Test podcast title',
  'userPlaybackPosition': 123
}

export const sampleQueueItems = [sampleQueueItem]
