import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { testUsers, v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('MediaRef endpoints', () => {

  describe('get by id', () => {
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/mediaRef/9rA5BhWp`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body.id).to.equal('9rA5BhWp')
          chaiExpect(res.body.endTime).to.equal(1680)
          chaiExpect(res.body.isPublic).to.equal(true)
          chaiExpect(res.body.pastHourTotalUniquePageviews).to.equal(7)
          chaiExpect(res.body.pastDayTotalUniquePageviews).to.equal(8)
          chaiExpect(res.body.pastWeekTotalUniquePageviews).to.equal(9)
          chaiExpect(res.body.pastMonthTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastYearTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastAllTimeTotalUniquePageviews).to.equal(2)
          chaiExpect(res.body.startTime).to.equal(1500)
          chaiExpect(res.body.title).to.equal('Amet aliquam id diam maecenas ultricies mi eget.')
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')
          chaiExpect(res.body.authors).to.eql([])
          chaiExpect(res.body.categories).to.eql([])
          

          const episode = res.body.episode
          chaiExpect(episode.id).to.equal('fFmGXkgIM')
          chaiExpect(episode).to.have.property('description')
          chaiExpect(episode.duration).to.equal(0)
          chaiExpect(episode.episodeType).to.equal('full')
          chaiExpect(episode.guid).to.equal('465b2bdc-eebd-11e9-85c8-171e42a72b35')
          chaiExpect(episode.imageUrl).to.equal(null)
          chaiExpect(episode.isExplicit).to.equal(false)
          chaiExpect(episode.isPublic).to.equal(true)
          chaiExpect(episode.linkUrl).to.equal(null)
          chaiExpect(episode.mediaFilesize).to.equal(0)
          chaiExpect(episode.mediaType).to.equal('audio/mpeg')
          chaiExpect(episode.mediaUrl).to.equal('https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/chtbl.com/track/524GE/traffic.megaphone.fm/VMP3689667624.mp3')
          chaiExpect(episode.pastHourTotalUniquePageviews).to.equal(1)
          chaiExpect(episode.pastDayTotalUniquePageviews).to.equal(2)
          chaiExpect(episode.pastWeekTotalUniquePageviews).to.equal(3)
          chaiExpect(episode.pastMonthTotalUniquePageviews).to.equal(4)
          chaiExpect(episode.pastYearTotalUniquePageviews).to.equal(5)
          chaiExpect(episode.pastAllTimeTotalUniquePageviews).to.equal(6)
          chaiExpect(episode).to.have.property('pubDate')
          chaiExpect(episode.title).to.equal('Jason Calacanis: TikTok should be banned, Tim Cook doesn\'t have enough \"chutzpah,\" and Uber will be fine')
          chaiExpect(episode.podcastId).to.equal('zRo1jwx67')
          chaiExpect(episode).to.have.property('createdAt')
          chaiExpect(episode).to.have.property('updatedAt')

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/mediaRef/9rA5BasdfhWp`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.equal('MediaRef not found')

          done()
        })
    })
  })
  describe('mediaRef create and delete', () => {
    const sendBody = {
      "authors": [],
      "categories": [],
      "endTime": 100,
      "episodeId": "gRgjd3YcKb",
      "isPublic": "true",
      "startTime": 50,
      "title": "Sample clip title"
    }

    let newMediaRefId = '' 

    test('Create: when the user is not logged in', async (done) => {
      chai.request(global.app)
        .post(`${v1Path}/mediaRef`)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)

          done()
        })
        
    })

    test('Create: when the user is logged in', async (done) => {
      chai.request(global.app)
        .post(`${v1Path}/mediaRef`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          newMediaRefId = res.body.id

          chaiExpect(res.body.authors).to.eql([])
          chaiExpect(res.body.categories).to.eql([])
          chaiExpect(res.body.endTime).to.equal(100)
          chaiExpect(res.body.isPublic).to.equal(false)
          chaiExpect(res.body.startTime).to.equal(50)
          chaiExpect(res.body.title).to.equal('Sample clip title')
          chaiExpect(res.body.owner).to.equal('QMReJmbE')
          chaiExpect(res.body.episode).to.equal('gRgjd3YcKb')
          chaiExpect(res.body).to.have.property('id')
          chaiExpect(res.body.pastHourTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastDayTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastWeekTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastMonthTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastYearTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastAllTimeTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')

          done()
        })
    })

    test('Delete: when the user is not logged in', async (done) => {
      chai.request(global.app)
        .delete(`${v1Path}/mediaRef/${newMediaRefId}`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)

          done()
        })
    })

    test('Delete: when the user is logged in', async (done) => {
      chai.request(global.app)
        .delete(`${v1Path}/mediaRef/${newMediaRefId}`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          done()
        })
    })
  })

  describe('find by query', () => {
    test('top past week', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/mediaRef?sort=top-past-week`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          const mediaRefs = res.body[0]
          const mediaRef = mediaRefs[0]
          
          chaiExpect(mediaRef.id).to.equal('9rA5BhWp')
          chaiExpect(mediaRef.endTime).to.equal(1680)
          chaiExpect(mediaRef.isPublic).to.equal(true)
          chaiExpect(mediaRef.pastHourTotalUniquePageviews).to.equal(7)
          chaiExpect(mediaRef.pastDayTotalUniquePageviews).to.equal(8)
          chaiExpect(mediaRef.pastWeekTotalUniquePageviews).to.equal(9)
          chaiExpect(mediaRef.pastMonthTotalUniquePageviews).to.equal(0)
          chaiExpect(mediaRef.pastYearTotalUniquePageviews).to.equal(1)
          chaiExpect(mediaRef.pastAllTimeTotalUniquePageviews).to.equal(2)
          chaiExpect(mediaRef.startTime).to.equal(1500)
          chaiExpect(mediaRef.title).to.equal('Amet aliquam id diam maecenas ultricies mi eget.')
          chaiExpect(mediaRef).to.have.property('createdAt')
          chaiExpect(mediaRef).to.have.property('updatedAt')
          
          chaiExpect(mediaRef.owner.id).to.equal('QMReJmbE')
          chaiExpect(mediaRef.owner).to.have.property('isPublic')
          chaiExpect(mediaRef.owner).to.have.property('name')

          done()
        })
    })
  })

  describe('MediaRef Update', () => {
    test('update', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/mediaRef`)
        .set('Cookie', testUsers.premium.authCookie)
        .send({
          "authors": [],
          "categories": [],
          "endTime": 100,
          "episodeId": "gRgjd3YcKb",
          "id": "o0WTxqON",
          "isPublic": "true",
          "startTime": 50,
          "title": "New sample clip title"
        })
        .end((err, res) => {
          chaiExpect(res).to.have.status(401);
          
          chaiExpect(res.body.message).to.equal('Log in to edit this media ref')

          done()
        })
    })
  })

})
