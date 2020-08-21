import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { sampleQueueItems, testUsers, v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('user endpoints', () => {

  describe('update queue', () => {

    const sendBody = {
      "queueItems": sampleQueueItems
    }

    test('when the user is not logged in', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user/update-queue`)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)

          done()
        })
    })

    test('when the user is logged in', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user/update-queue`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          const queueItem = res.body[0]
          chaiExpect(queueItem).to.have.property('clipEndTime', 1199)
          chaiExpect(queueItem).to.have.property('clipId', 'jxv22OGr')
          chaiExpect(queueItem).to.have.property('clipStartTime', 1114)
          chaiExpect(queueItem).to.have.property('clipTitle', 'Test clip title')
          chaiExpect(queueItem).to.have.property('episodeDescription', 'Test episode description')
          chaiExpect(queueItem).to.have.property('episodeId', 'gRgjd3YcKb')
          chaiExpect(queueItem).to.have.property('episodeImageUrl', 'http://example.com/imageUrl')
          chaiExpect(queueItem).to.have.property('episodeMediaUrl', 'http://example.com/mediaUrl')
          chaiExpect(queueItem).to.have.property('episodePubDate', '2019-01-01T23:54:08.000Z')
          chaiExpect(queueItem).to.have.property('episodeTitle', 'Test episode title')
          chaiExpect(queueItem).to.have.property('isPublic', true)
          chaiExpect(queueItem).to.have.property('ownerId', 'EVHDBRZY')
          chaiExpect(queueItem).to.have.property('ownerIsPublic', true)
          chaiExpect(queueItem).to.have.property('ownerName', 'Free Trial Valid - Test User')
          chaiExpect(queueItem.podcastAuthors).to.eql(['Rk1zs7vs'])
          chaiExpect(queueItem.podcastCategories).to.eql(['5vNa3RnSZpC'])
          chaiExpect(queueItem).to.have.property('podcastId', '0RMk6UYGq')
          chaiExpect(queueItem).to.have.property('podcastImageUrl', 'http://example.com/imageUrl')
          chaiExpect(queueItem).to.have.property('podcastTitle', 'Test podcast title')
          chaiExpect(queueItem).to.have.property('userPlaybackPosition', 123)

          done()
        })
    })
  })

})
