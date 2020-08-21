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
            chaiExpect(res.body.id).to.eql('EVHDBRZY')
            chaiExpect(res.body.isPublic).to.eql(true)
            chaiExpect(res.body.name).to.eql('Free Trial Valid - Test User')
  
            //subscribedPodcastId
            done()
          })
      })

      test('when an invalid id is provided', async (done) => {
        chai.request(global.app)
          .get(`${v1Path}/user/EVHDBRgfdsaZY`)
          .end((err, res) => {
            chaiExpect(res).to.have.status(404);
            chaiExpect(res.body.message).to.eql('User not found.')

            done()
          })
      })
    })

    // describe('update', () => {
    //   const sendBody = {
    //     "email": "premium@stage.podverse.fm",
    //     "id": "QMReJmbE",
    //     "isPublic": "true",
    //     "name": "Kyle"
    //   }

    //   test('when the user is not logged in', async (done) => {
    //     chai.request(global.app)
    //       .patch(`${v1Path}/user`)
    //       .send(sendBody)
    //       .end((err, res) => {
    //         chaiExpect(res).to.have.status(401)

    //         done()
    //       })
    //   })
      
    //   test('when the user is logged in', async (done) => {
    //     chai.request(global.app)
    //       .patch(`${v1Path}/user`)
    //       .set('Cookie', testUsers.premium.authCookie)
    //       .send(sendBody)
    //       .end((err, res) => {
    //         chaiExpect(res).to.have.status(200)

    //         const body = res.body
    //         // expects

    //         done()
    //       })
    //   })
    // })

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
            chaiExpect(queueItem.clipEndTime).to.eql(1199)
            chaiExpect(queueItem.clipId).to.eql('jxv22OGr')
            chaiExpect(queueItem.clipStartTime).to.eql(1114)
            chaiExpect(queueItem.clipTitle).to.eql('Test clip title')
            chaiExpect(queueItem.episodeDescription).to.eql('Test episode description')
            chaiExpect(queueItem.episodeId).to.eql('gRgjd3YcKb')
            chaiExpect(queueItem.episodeImageUrl).to.eql('http://example.com/imageUrl')
            chaiExpect(queueItem.episodeMediaUrl).to.eql('http://example.com/mediaUrl')
            chaiExpect(queueItem.episodePubDate).to.eql('2019-01-01T23:54:08.000Z')
            chaiExpect(queueItem.episodeTitle).to.eql('Test episode title')
            chaiExpect(queueItem.isPublic).to.eql(true)
            chaiExpect(queueItem.ownerId).to.eql('EVHDBRZY')
            chaiExpect(queueItem.ownerIsPublic).to.eql(true)
            chaiExpect(queueItem.ownerName).to.eql('Free Trial Valid - Test User')
            chaiExpect(queueItem.podcastAuthors).to.eql(['Rk1zs7vs'])
            chaiExpect(queueItem.podcastCategories).to.eql(['5vNa3RnSZpC'])
            chaiExpect(queueItem.podcastId).to.eql('0RMk6UYGq')
            chaiExpect(queueItem.podcastImageUrl).to.eql('http://example.com/imageUrl')
            chaiExpect(queueItem.podcastTitle).to.eql('Test podcast title')
            chaiExpect(queueItem.userPlaybackPosition).to.eql(123)

            done()
          })
      })
    })
})
