import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { sampleQueueItems, testUsers, v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_user endpoints', () => {

    describe('get by id', () => {
      test('when a valid id is provided', async (done) => {
        chai.request(global.app)
          .get(`${v1Path}/user/EVHDBRZY`)
          .end((err, res) => {
            chaiExpect(res).to.have.status(200);
            chaiExpect(res.body.id).to.equal('EVHDBRZY')
            chaiExpect(res.body.isPublic).to.equal(true)
            chaiExpect(res.body.name).to.equal('Free Trial Valid - Test User')
  
            //subscribedPodcastId
            done()
          })
      })

      test('when an invalid id is provided', async (done) => {
        chai.request(global.app)
          .get(`${v1Path}/user/EVHDBRgfdsaZY`)
          .end((err, res) => {
            chaiExpect(res).to.have.status(404);
            chaiExpect(res.body.message).to.equal('User not found.')

            done()
          })
      })
    })

    describe('update', () => {
      const sendBody = {
        "email": "premium@stage.podverse.fm",
        "id": "QMReJmbE",
        "isPublic": "true",
        "name": "Kyle"
      }

      test('when the user is not logged in', async (done) => {
        chai.request(global.app)
          .patch(`${v1Path}/user`)
          .send(sendBody)
          .end((err, res) => {
            chaiExpect(res).to.have.status(401)

            done()
          })
      })
      
      // test('when the user is logged in', async (done) => {
      //   chai.request(global.app)
      //     .patch(`${v1Path}/user`)
      //     .set('Cookie', testUsers.premium.authCookie)
      //     .send(sendBody)
      //     .end((err, res) => {
      //       chaiExpect(res).to.have.status(200)

      //       const body = res.body
      //       // expects

      //       done()
      //     })
      // })
    })

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
            chaiExpect(queueItem.clipEndTime).to.equal(1199)
            chaiExpect(queueItem.clipId).to.equal('jxv22OGr')
            chaiExpect(queueItem.clipStartTime).to.equal(1114)
            chaiExpect(queueItem.clipTitle).to.equal('Test clip title')
            chaiExpect(queueItem.episodeDescription).to.equal('Test episode description')
            chaiExpect(queueItem.episodeId).to.equal('gRgjd3YcKb')
            chaiExpect(queueItem.episodeImageUrl).to.equal('http://example.com/imageUrl')
            chaiExpect(queueItem.episodeMediaUrl).to.equal('http://example.com/mediaUrl')
            chaiExpect(queueItem.episodePubDate).to.equal('2019-01-01T23:54:08.000Z')
            chaiExpect(queueItem.episodeTitle).to.equal('Test episode title')
            chaiExpect(queueItem.isPublic).to.equal(true)
            chaiExpect(queueItem.ownerId).to.equal('EVHDBRZY')
            chaiExpect(queueItem.ownerIsPublic).to.equal(true)
            chaiExpect(queueItem.ownerName).to.equal('Free Trial Valid - Test User')
            chaiExpect(queueItem.podcastAuthors).to.eql(['Rk1zs7vs'])
            chaiExpect(queueItem.podcastCategories).to.eql(['5vNa3RnSZpC'])
            chaiExpect(queueItem.podcastId).to.equal('0RMk6UYGq')
            chaiExpect(queueItem.podcastImageUrl).to.equal('http://example.com/imageUrl')
            chaiExpect(queueItem.podcastTitle).to.equal('Test podcast title')
            chaiExpect(queueItem.userPlaybackPosition).to.equal(123)

            done()
          })
      })
    })
})
