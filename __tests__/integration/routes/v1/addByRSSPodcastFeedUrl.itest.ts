import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { testUsers, v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('AddByRSSPodcastFeedUrl endpoints', () => {
  describe('Add', () => {
    const sendBody = {
      addByRSSPodcastFeedUrl: 'http://rss.art19.com/the-daily'
    }
    test('Unauthorized', async (done) => {
      chai
        .request(global.app)
        .post(`${v1Path}/add-by-rss-podcast-feed-url/add`)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)

          done()
        })
    })
    test('Invalid Account', async (done) => {
      chai
        .request(global.app)
        .post(`${v1Path}/add-by-rss-podcast-feed-url/add`)
        .set('Cookie', testUsers.premiumExpired.authCookie)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)
          chaiExpect(res.body.message).to.equal('Premium Membership Required')
          chaiExpect(res.body.code).to.equal(123)
          chaiExpect(Object.keys(res.body).length).to.equal(2)

          done()
        })
    })
    test('Premium Valid', async (done) => {
      chai
        .request(global.app)
        .post(`${v1Path}/add-by-rss-podcast-feed-url/add`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)
          chaiExpect(res.body[0]).to.equal('http://feed.thisamericanlife.org/talpodcast')
          chaiExpect(res.body[1]).to.equal('https://feeds.npr.org/344098539/podcast.xml')
          chaiExpect(res.body[2]).to.equal('https://feeds.npr.org/381444908/podcast.xml')
          chaiExpect(res.body[3]).to.equal('http://rss.art19.com/the-daily')
          chaiExpect(Object.keys(res.body).length).to.equal(4)

          done()
        })
    })
  })
  describe('Remove', () => {
    const sendBody = {
      addByRSSPodcastFeedUrl: 'https://feeds.npr.org/381444908/podcast.xml'
    }
    test('Unauthorized', async (done) => {
      chai
        .request(global.app)
        .post(`${v1Path}/add-by-rss-podcast-feed-url/remove`)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)

          done()
        })
    })
    test('Invalid Account', async (done) => {
      chai
        .request(global.app)
        .post(`${v1Path}/add-by-rss-podcast-feed-url/remove`)
        .set('Cookie', testUsers.premiumExpired.authCookie)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)
          chaiExpect(res.body.message).to.equal('Premium Membership Required')
          chaiExpect(res.body.code).to.equal(123)
          chaiExpect(Object.keys(res.body).length).to.equal(2)

          done()
        })
    })
    test('Premium Valid', async (done) => {
      chai
        .request(global.app)
        .post(`${v1Path}/add-by-rss-podcast-feed-url/remove`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)
          chaiExpect(res.body[0]).to.equal('http://feed.thisamericanlife.org/talpodcast')
          chaiExpect(res.body[1]).to.equal('https://feeds.npr.org/344098539/podcast.xml')
          chaiExpect(res.body[2]).to.equal('http://rss.art19.com/the-daily')
          chaiExpect(Object.keys(res.body).length).to.equal(3)

          done()
        })
    })
  })
})
