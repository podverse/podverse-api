import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { testUsers, v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_userQueueItem endpoints', () => {

  describe('Add or Update', () => {
    const sendbodyNull = {
      "episodeId": null,
      "mediaRefId": null,
      "queuePosition": 0
    }
    const sendbodyEpisodeValid = {
      "episodeId": "n43uIo6zR8",
      "mediaRefId": null,
      "queuePosition": 1
    }
    const sendbodyMediaRefValid = {
      "episodeId": null,
      "mediaRefId": "jE4kZmZhl9",
      "queuePosition": 0
    }
    const sendbodyEpisodeInvalid = {
      "episodeId": "n43uIo6zR8zzz",
      "mediaRefId": null,
      "queuePosition": 0
    }
    const sendbodyMediaRefInvalid = {
      "episodeId": null,
      "mediaRefId": "jE4kZmZhl9zzz",
      "queuePosition": 0
    }
    const sendbodyBothIds = {
      "episodeId": "n43uIo6zR8",
      "mediaRefId": "jE4kZmZhl9",
      "queuePosition": 0
    }
    test('Null Values', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-queue-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyNull)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })

    //TODO> Invalid Table Schema

    test('Episode Invalid', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-queue-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyEpisodeInvalid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(500);
          
          chaiExpect(res.body.message).to.equal('insert or update on table \"userQueueItems\" violates foreign key constraint \"FK_2367e28002d5b0e577e5084b967\"')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
    test('MediaRef Invalid', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-queue-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyMediaRefInvalid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(500);
          
          chaiExpect(res.body.message).to.equal('insert or update on table \"userQueueItems\" violates foreign key constraint \"FK_5d3167b5c0df34e3a550fd8d6e8\"')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
    test('Both Ids', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-queue-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyBothIds)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          
          chaiExpect(res.body.message).to.equal('Either an episodeId or mediaRefId must be provided, but not both. Set null for the value that should not be included.')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
    test('MediaRef Valid', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-queue-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyMediaRefValid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
    test('Episode Valid', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-queue-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyEpisodeValid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('Get Items', () => {
    test('Get', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/user-queue-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          const userQueueItemsEpisode = res.body.userQueueItems[0]
          chaiExpect(userQueueItemsEpisode).to.have.property('episodeDescription')
          chaiExpect(userQueueItemsEpisode.episodeDuration).to.equal(0)
          chaiExpect(userQueueItemsEpisode.episodeId).to.equal('n43uIo6zR8')
          chaiExpect(userQueueItemsEpisode.episodeMediaUrl).to.equal('https://dts.podtrac.com/redirect.mp3/www.buzzsprout.com/1/814110-7-launch-your-new-podcast.mp3?blob_id=1707517')
          chaiExpect(userQueueItemsEpisode).to.have.property('episodePubDate')
          chaiExpect(userQueueItemsEpisode.episodeTitle).to.equal(`#7 Launch your new podcast!`)
          chaiExpect(userQueueItemsEpisode).to.have.property('id')
          chaiExpect(userQueueItemsEpisode.podcastId).to.equal('QHQ_bdmS8B')
          chaiExpect(userQueueItemsEpisode.podcastImageUrl).to.equal('https://storage.buzzsprout.com/variants/67b7vYUiagqpNz9ZG5qwSFmE/f81607a3cd537406cf0cf506c726bfe2824c5e584c9e9dc5e04e42436c820a79?.jpg')
          chaiExpect(userQueueItemsEpisode.podcastShrunkImageUrl).to.equal('https://storage.buzzsprout.com/variants/67b7vYUiagqpNz9ZG5qwSFmE/f81607a3cd537406cf0cf506c726bfe2824c5e584c9e9dc5e04e42436c820a79?.jpg')
          chaiExpect(userQueueItemsEpisode.podcastTitle).to.equal('How to Start a Podcast')
          chaiExpect(userQueueItemsEpisode.queuePosition).to.equal(1000)

          const userQueueItemsClip = res.body.userQueueItems[1]
          chaiExpect(userQueueItemsClip.clipEndTime).to.equal(632)
          chaiExpect(userQueueItemsClip.clipId).to.equal('jE4kZmZhl9')
          chaiExpect(userQueueItemsClip.clipStartTime).to.equal(482)
          chaiExpect(userQueueItemsClip.clipTitle).to.equal('One more soundbite title')
          chaiExpect(userQueueItemsClip).to.have.property('episodeDescription')
          chaiExpect(userQueueItemsClip.episodeDuration).to.equal(0)
          chaiExpect(userQueueItemsClip.episodeId).to.equal('n43uIo6zR8')
          chaiExpect(userQueueItemsClip.episodeMediaUrl).to.equal('https://dts.podtrac.com/redirect.mp3/www.buzzsprout.com/1/814110-7-launch-your-new-podcast.mp3?blob_id=1707517')
          chaiExpect(userQueueItemsClip).to.have.property('episodePubDate')
          chaiExpect(userQueueItemsClip.episodeTitle).to.equal(`#7 Launch your new podcast!`)
          chaiExpect(userQueueItemsClip).to.have.property('id')
          chaiExpect(userQueueItemsClip.podcastId).to.equal('QHQ_bdmS8B')
          chaiExpect(userQueueItemsClip.podcastImageUrl).to.equal('https://storage.buzzsprout.com/variants/67b7vYUiagqpNz9ZG5qwSFmE/f81607a3cd537406cf0cf506c726bfe2824c5e584c9e9dc5e04e42436c820a79?.jpg')
          chaiExpect(userQueueItemsClip.podcastShrunkImageUrl).to.equal('https://storage.buzzsprout.com/variants/67b7vYUiagqpNz9ZG5qwSFmE/f81607a3cd537406cf0cf506c726bfe2824c5e584c9e9dc5e04e42436c820a79?.jpg')
          chaiExpect(userQueueItemsClip.podcastTitle).to.equal('How to Start a Podcast')
          chaiExpect(userQueueItemsClip.queuePosition).to.equal(2000)

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('Pop Next', () => {
    test('Get', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/user-queue-item/pop-next`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          const nextItem = res.body.nextItem
          chaiExpect(nextItem).to.have.property('id')
          chaiExpect(nextItem.queuePosition).to.equal(1000)


          chaiExpect(Object.keys(res.body).length).to.equal(2)

          done()
        })
    })
  })

  describe('Remove by EpisodeId', () => {
    const sendbodyEpisodeValid = {
      "episodeId": "n43uIo6zR8",
      "mediaRefId": null,
      "queuePosition": 1
    }
    test('Episode Valid', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-queue-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyEpisodeValid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
    test('Delete Episode', async (done) => {
      chai.request(global.app)
        .delete(`${v1Path}/user-queue-item/episode/n43uIo6zR8`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          chaiExpect(res.body).to.have.property('userQueueItems')

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('Remove by MediaRefId', () => {
    test('Delete MediaRef', async (done) => {
      chai.request(global.app)
        .delete(`${v1Path}/user-queue-item/mediaRef/jE4kZmZhl9`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          chaiExpect(res.body).to.have.property('userQueueItems')

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('Remove All for User', () => {
    const sendbodyEpisodeValid = {
      "episodeId": "n43uIo6zR8",
      "mediaRefId": null,
      "queuePosition": 1
    }
    const sendbodyMediaRefValid = {
      "episodeId": null,
      "mediaRefId": "jE4kZmZhl9",
      "queuePosition": 0
    }
    test('MediaRef Valid', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-queue-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyMediaRefValid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
    test('Episode Valid', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-queue-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyEpisodeValid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
    test('Delete', async (done) => {
      chai.request(global.app)
        .delete(`${v1Path}/user-queue-item/remove-all`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          chaiExpect(res.body.message).to.equal("All UserQueueItems deleted.")

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

})

