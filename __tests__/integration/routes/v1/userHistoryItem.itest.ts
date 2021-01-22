import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { testUsers, v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_userHistoryItem endpoints', () => {

  describe('Add or Update', () => {
    const sendbodyNull = {
      "episodeId": null,
      "forceUpdateOrderDate": false,
      "mediaRefId": null,
      "userPlaybackPosition": 100
    }
    const sendbodyMediaRefValid = {
      "episodeId": null,
      "forceUpdateOrderDate": false,
      "mediaRefId": "9rA5BhWp",
      "userPlaybackPosition": 100
    }
    const sendbodyEpisodeValid = {
      "episodeId": "3TENCQO2Q",
      "forceUpdateOrderDate": false,
      "mediaRefId": null,
      "userPlaybackPosition": 100
    }
    const sendbodyMediaRefInvalid = {
      "episodeId": null,
      "forceUpdateOrderDate": false,
      "mediaRefId": "9rA5BhWpzzz",
      "userPlaybackPosition": 100
    }
    const sendbodyEpisodeInvalid = {
      "episodeId": "3TENCQO2Qzzz",
      "forceUpdateOrderDate": false,
      "mediaRefId": null,
      "userPlaybackPosition": 100
    }
    const sendbodyBothIds = {
      "episodeId": "3TENCQO2Q",
      "forceUpdateOrderDate": false,
      "mediaRefId": "9rA5BhWp",
      "userPlaybackPosition": 100
    }
    // const sendbodyMediaRefUpdated = {
    //   "episodeId": null,
    //   "forceUpdateOrderDate": true,
    //   "mediaRefId": "9rA5BhWp",
    //   "userPlaybackPosition": 100
    // }
    // const sendbodyEpisodeUpdated = {
    //   "episodeId": "3TENCQO2Q",
    //   "forceUpdateOrderDate": true,
    //   "mediaRefId": null,
    //   "userPlaybackPosition": 100
    // }
    test('Null Values', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-history-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyNull)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          
          chaiExpect(res.body.message).to.equal('An episodeId or mediaRefId must be provided.')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
    test('MediaRef Valid', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-history-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyMediaRefValid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          
          chaiExpect(res.body.message).to.equal('Updated user history item.')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
    test('Episode Valid', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-history-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyEpisodeValid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          
          chaiExpect(res.body.message).to.equal('Updated user history item.')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
    test('MediaRef Invalid', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-history-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyMediaRefInvalid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(500);
          
          chaiExpect(res.body.message).to.equal('insert or update on table \"userHistoryItems\" violates foreign key constraint \"FK_e87e78a873e585bbd2f544ee2ae\"')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
    test('Episode Invalid', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-history-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyEpisodeInvalid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(500);
          
          chaiExpect(res.body.message).to.equal('insert or update on table \"userHistoryItems\" violates foreign key constraint \"FK_acfcaa8bcf9c198372a9b90207b\"')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
    test('Both Episode & MediaRef Ids', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-history-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyBothIds)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          
          chaiExpect(res.body.message).to.equal('Either an episodeId or mediaRefId must be provided, but not both. Set null for the value that should not be included.')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('Get Items', () => {
    test('Page 1', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/user-history-item?page=1`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          const userHistoryItemsEpisode = res.body.userHistoryItems[0]
          chaiExpect(userHistoryItemsEpisode).to.have.property('episodeDescription')
          chaiExpect(userHistoryItemsEpisode.episodeDuration).to.equal(0)
          chaiExpect(userHistoryItemsEpisode.episodeId).to.equal('3TENCQO2Q')
          chaiExpect(userHistoryItemsEpisode.episodeMediaUrl).to.equal('https://play.podtrac.com/npr-381444908/edge1.pod.npr.org/anon.npr-podcasts/podcast/npr/fa/2020/04/20200402_fa_fapodthurs-7f668f53-d5d7-4ed7-8656-90d0d2623074.mp3?awCollectionId=381444908&awEpisodeId=825948868&orgId=1&d=2925&p=381444908&story=825948868&t=podcast&e=825948868&size=46698453&ft=pod&f=381444908')
          chaiExpect(userHistoryItemsEpisode).to.have.property('episodePubDate')
          chaiExpect(userHistoryItemsEpisode.episodeTitle).to.equal(`A 'War Doctor' Shares Stories From The Front Line`)
          chaiExpect(userHistoryItemsEpisode).to.have.property('id')
          chaiExpect(userHistoryItemsEpisode.podcastId).to.equal('KxuLCnpZ')
          chaiExpect(userHistoryItemsEpisode.podcastImageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/3HeyouLqW/freshair.jpg')
          chaiExpect(userHistoryItemsEpisode.podcastShrunkImageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/3HeyouLqW/freshair.jpg')
          chaiExpect(userHistoryItemsEpisode.podcastTitle).to.equal('Fresh Air')
          chaiExpect(userHistoryItemsEpisode.userPlaybackPosition).to.equal(100)

          const userHistoryItemsClip = res.body.userHistoryItems[1]
          chaiExpect(userHistoryItemsClip.clipEndTime).to.equal(1680)
          chaiExpect(userHistoryItemsClip.clipId).to.equal('9rA5BhWp')
          chaiExpect(userHistoryItemsClip.clipStartTime).to.equal(1500)
          chaiExpect(userHistoryItemsClip.clipTitle).to.equal('Amet aliquam id diam maecenas ultricies mi eget.')
          chaiExpect(userHistoryItemsClip).to.have.property('episodeDescription')
          chaiExpect(userHistoryItemsClip.episodeDuration).to.equal(0)
          chaiExpect(userHistoryItemsClip.episodeId).to.equal('fFmGXkgIM')
          chaiExpect(userHistoryItemsClip.episodeMediaUrl).to.equal('https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/chtbl.com/track/524GE/traffic.megaphone.fm/VMP3689667624.mp3')
          chaiExpect(userHistoryItemsClip).to.have.property('episodePubDate')
          chaiExpect(userHistoryItemsClip.episodeTitle).to.equal(`Jason Calacanis: TikTok should be banned, Tim Cook doesn't have enough \"chutzpah,\" and Uber will be fine`)
          chaiExpect(userHistoryItemsClip).to.have.property('id')
          chaiExpect(userHistoryItemsClip.podcastId).to.equal('zRo1jwx67')
          chaiExpect(userHistoryItemsClip.podcastImageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/-cykCbiMI3/recodedecode.png')
          chaiExpect(userHistoryItemsClip.podcastShrunkImageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/-cykCbiMI3/recodedecode.png')
          chaiExpect(userHistoryItemsClip.podcastTitle).to.equal('Recode Decode')

          chaiExpect(Object.keys(res.body).length).to.equal(2)

          done()
        })
    })
  })

  describe('Get Items Metadata', () => {
    test('Get', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/user-history-item/metadata`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          chaiExpect(res.body.userHistoryItems[0].userPlaybackPosition).to.equal(100)
          chaiExpect(res.body.userHistoryItems[0].episodeId).to.equal('3TENCQO2Q')

          chaiExpect(res.body.userHistoryItems[1].userPlaybackPosition).to.equal(100)
          chaiExpect(res.body.userHistoryItems[1].mediaRefId).to.equal('9rA5BhWp')

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('Remove by EpisodeId', () => {
    test('Delete', async (done) => {
      chai.request(global.app)
        .delete(`${v1Path}/user-history-item/episode/3TENCQO2Q`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          chaiExpect(res.body.message).to.equal("UserHistoryItem deleted.")

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('Remove by MediaRefId', () => {
    test('Delete', async (done) => {
      chai.request(global.app)
        .delete(`${v1Path}/user-history-item/mediaRef/9rA5BhWp`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          chaiExpect(res.body.message).to.equal("UserHistoryItem deleted.")

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('Remove All for User', () => {
    const sendbodyMediaRefValid = {
      "episodeId": null,
      "forceUpdateOrderDate": false,
      "mediaRefId": "9rA5BhWp",
      "userPlaybackPosition": 100
    }
    const sendbodyEpisodeValid = {
      "episodeId": "3TENCQO2Q",
      "forceUpdateOrderDate": false,
      "mediaRefId": null,
      "userPlaybackPosition": 100
    }
    test('MediaRef Valid', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-history-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyMediaRefValid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          
          chaiExpect(res.body.message).to.equal('Updated user history item.')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
    test('Episode Valid', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-history-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyEpisodeValid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          
          chaiExpect(res.body.message).to.equal('Updated user history item.')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
    test('Delete', async (done) => {
      chai.request(global.app)
        .delete(`${v1Path}/user-history-item/remove-all`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          chaiExpect(res.body.message).to.equal("All UserHistoryItems deleted.")

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

})

