import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { testUsers, v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_userNowPlayingItem endpoints', () => {
  const sendbodyEpisodeValid = {
    episodeId: 'gRgjd3YcKb',
    clipId: null,
    userPlaybackPosition: 0
  }
  const sendbodyClipValid = {
    episodeId: null,
    clipId: 'jE4kZmZhl9',
    userPlaybackPosition: 1
  }
  // const sendbodyBoth = {
  //   "episodeId": "gRgjd3YcKb",
  //   "clipId": "jE4kZmZhl9",
  //   "userPlaybackPosition": 0
  // }

  describe('Update Items', () => {
    test('Update Episode', async (done) => {
      chai
        .request(global.app)
        .patch(`${v1Path}/user-now-playing-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyEpisodeValid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          chaiExpect(res.body.message).to.equal('UserNowPlayingItem updated.')

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })

    test('Update Clip', async (done) => {
      chai
        .request(global.app)
        .patch(`${v1Path}/user-now-playing-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendbodyClipValid)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          chaiExpect(res.body.message).to.equal('UserNowPlayingItem updated.')

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('Get Items', () => {
    test('Get', async (done) => {
      chai
        .request(global.app)
        .get(`${v1Path}/user-now-playing-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          chaiExpect(res.body.mediaRef.id).to.equal('jE4kZmZhl9')

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('Delete Items', () => {
    test('Delete', async (done) => {
      chai
        .request(global.app)
        .delete(`${v1Path}/user-now-playing-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          chaiExpect(res.body.message).to.equal('UserNowPlayingItem deleted.')

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('Get Items', () => {
    test('Get', async (done) => {
      chai
        .request(global.app)
        .get(`${v1Path}/user-now-playing-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404)

          chaiExpect(res.body.message).to.equal('No now playing item found')

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })
})
