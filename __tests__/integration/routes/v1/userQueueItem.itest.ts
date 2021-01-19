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
      "queuePosition": 0
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
    test('MediaRef Invalid', async (done) => {
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
  })

})

