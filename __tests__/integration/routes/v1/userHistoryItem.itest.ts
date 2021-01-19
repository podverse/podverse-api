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

})

