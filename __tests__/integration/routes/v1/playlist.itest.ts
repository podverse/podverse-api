import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { testUsers, v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('Playlist endpoints', () => {

  describe('get by id', () => {
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/playlist/CH_2-LlM`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body.id).to.equal('CH_2-LlM')
          chaiExpect(res.body).to.have.property('description')
          chaiExpect(res.body.isPublic).to.equal(false)
          chaiExpect(res.body.itemCount).to.equal(2)
          chaiExpect(res.body.itemsOrder).to.eql([])
          chaiExpect(res.body.title).to.equal('Premium - Test Playlist 2')
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')
          chaiExpect(res.body.episodes).to.eql([])

          const mediaRef = res.body.mediaRefs[0]

          chaiExpect(mediaRef.id).to.equal('6UFQc7Lq')
          chaiExpect(mediaRef.endTime).to.equal(1496)
          chaiExpect(mediaRef.imageUrl).to.equal(null)
          chaiExpect(mediaRef.isOfficialChapter).to.equal(false)
          chaiExpect(mediaRef.isOfficialSoundBite).to.equal(false)
          chaiExpect(mediaRef.isPublic).to.equal(true)
          chaiExpect(mediaRef.linkUrl).to.equal(null)
          chaiExpect(mediaRef.pastHourTotalUniquePageviews).to.equal(2)
          chaiExpect(mediaRef.pastDayTotalUniquePageviews).to.equal(3)
          chaiExpect(mediaRef.pastWeekTotalUniquePageviews).to.equal(4)
          chaiExpect(mediaRef.pastMonthTotalUniquePageviews).to.equal(5)
          chaiExpect(mediaRef.pastYearTotalUniquePageviews).to.equal(6)
          chaiExpect(mediaRef.pastAllTimeTotalUniquePageviews).to.equal(7)
          chaiExpect(mediaRef.startTime).to.equal(1366)
          chaiExpect(mediaRef.title).to.equal('Viverra orci sagittis eu volutpat odio facilisis mauris sit.')
          chaiExpect(mediaRef).to.have.property('createdAt')
          chaiExpect(mediaRef).to.have.property('updatedAt')

          const episode = res.body.mediaRefs[0].episode

          chaiExpect(episode.id).to.equal('4uE26PEF_y')
          chaiExpect(episode.chaptersType).to.equal(null)
          chaiExpect(episode.chaptersUrl).to.equal(null)
          chaiExpect(episode.chaptersUrlLastParsed).to.equal(null)
          chaiExpect(episode).to.have.property('description')
          chaiExpect(episode.duration).to.equal(0)
          chaiExpect(episode.episodeType).to.equal('full')
          chaiExpect(episode.funding).to.equal(null)
          chaiExpect(episode.guid).to.equal('a8b419d6-e479-11e9-8a03-dbf8d5adfaf2')
          chaiExpect(episode.imageUrl).to.equal(null)
          chaiExpect(episode.isExplicit).to.equal(false)
          chaiExpect(episode.isPublic).to.equal(true)
          chaiExpect(episode.linkUrl).to.equal(null)
          chaiExpect(episode.mediaFilesize).to.equal(0)
          chaiExpect(episode.mediaType).to.equal('audio/mpeg')
          chaiExpect(episode.mediaUrl).to.equal('https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/chtbl.com/track/524GE/traffic.megaphone.fm/VMP3630362992.mp3')
          chaiExpect(episode.pastHourTotalUniquePageviews).to.equal(1)
          chaiExpect(episode.pastDayTotalUniquePageviews).to.equal(2)
          chaiExpect(episode.pastWeekTotalUniquePageviews).to.equal(3)
          chaiExpect(episode.pastMonthTotalUniquePageviews).to.equal(4)
          chaiExpect(episode.pastYearTotalUniquePageviews).to.equal(5)
          chaiExpect(episode.pastAllTimeTotalUniquePageviews).to.equal(6)
          chaiExpect(episode.pubDate).to.equal('2019-11-22T05:01:00.000Z')
          chaiExpect(episode.title).to.equal('Innovation in the midwest: Entrepreneurship outside of Silicon Valley')
          chaiExpect(episode.transcript).to.equal(null)
          chaiExpect(episode.podcastId).to.equal('zRo1jwx67')
          chaiExpect(episode).to.have.property('createdAt')
          chaiExpect(episode).to.have.property('updatedAt')

          const podcast = res.body.mediaRefs[0].episode.podcast

          chaiExpect(podcast.id).to.equal('zRo1jwx67')
          chaiExpect(podcast.podcastIndexId).to.equal(null)
          chaiExpect(podcast.authorityId).to.equal(null)
          chaiExpect(podcast.alwaysFullyParse).to.equal(false)
          chaiExpect(podcast).to.have.property('description')
          chaiExpect(podcast.feedLastParseFailed).to.equal(false)
          chaiExpect(podcast).to.have.property('feedLastUpdated')
          chaiExpect(podcast.funding).to.equal(null)
          chaiExpect(podcast.guid).to.equal(null)
          chaiExpect(podcast.hideDynamicAdsWarning).to.equal(false)
          chaiExpect(podcast.imageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/-cykCbiMI3/recodedecode.png')
          chaiExpect(podcast.isExplicit).to.equal(false)
          chaiExpect(podcast.isPublic).to.equal(true)
          chaiExpect(podcast.language).to.equal('en-us')
          chaiExpect(podcast).to.have.property('lastEpisodePubDate')
          chaiExpect(podcast.lastEpisodeTitle).to.equal(`Episode 500: Slack CEO Stewart Butterfield on coronavirus, working from home, and Slack's redesign`)
          chaiExpect(podcast.linkUrl).to.equal('https://www.vox.com/recode-decode-podcast-kara-swisher')
          chaiExpect(podcast.pastAllTimeTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.pastHourTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.pastDayTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.pastWeekTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.pastMonthTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.pastYearTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.shrunkImageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/-cykCbiMI3/recodedecode.png')
          chaiExpect(podcast.sortableTitle).to.equal('recode decode')
          chaiExpect(podcast.title).to.equal('Recode Decode')
          chaiExpect(podcast.type).to.equal('episodic')
          chaiExpect(podcast.value).to.equal(null)
          chaiExpect(podcast).to.have.property('createdAt')
          chaiExpect(podcast).to.have.property('updatedAt')

          chaiExpect(Object.keys(res.body).length).to.equal(12)

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/playlist/CH_2-LasdflM`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.equal('Playlist not found')

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  let newPlaylistId = ''

  describe('playlist create', () => {
    const sendBody = {
      "description": "Test description",
      "isPublic": true,
      "itemsOrder": [],
      "mediaRefs": [],
      "title": "Test title"
    }

    test('when the user is not logged in', async (done) => {
      chai.request(global.app)
        .post(`${v1Path}/playlist`)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)

          chaiExpect(Object.keys(res.body).length).to.equal(0)

          done()
        })
    })

    test('when the user is logged in', async (done) => {
      chai.request(global.app)
        .post(`${v1Path}/playlist`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          newPlaylistId = res.body.id

          chaiExpect(res.body.description).to.equal('Test description')
          chaiExpect(res.body.isPublic).to.equal(true)
          chaiExpect(res.body.itemsOrder).to.eql([])
          chaiExpect(res.body.mediaRefs).to.eql([])
          chaiExpect(res.body.title).to.equal('Test title')
          chaiExpect(res.body.owner).to.equal('QMReJmbE')
          chaiExpect(res.body).to.have.property('id')
          chaiExpect(res.body.itemCount).to.equal(0)
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')

          chaiExpect(Object.keys(res.body).length).to.equal(11)

          done()
        })
    })
  })

  describe('playlist update', () => {

    const sendBody = {
      "description": "New test description",
      "isPublic": false,
      "itemsOrder": [],
      "mediaRefs": [],
      "title": "Premium - Test Playlist 2345"
    } as any

    test('when the user is not logged in', async (done) => {
      sendBody.id = newPlaylistId

      chai.request(global.app)
        .patch(`${v1Path}/playlist`)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)

          chaiExpect(Object.keys(res.body).length).to.equal(0)

          done()
        })
    })

    test('when the user is logged in', async (done) => {
      sendBody.id = newPlaylistId

      chai.request(global.app)
        .patch(`${v1Path}/playlist`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          chaiExpect(res.body.id).to.equal(newPlaylistId)
          chaiExpect(res.body.description).to.equal('New test description')
          chaiExpect(res.body.isPublic).to.equal(false)
          chaiExpect(res.body.itemCount).to.equal(0)
          chaiExpect(res.body.itemsOrder).to.eql([])
          chaiExpect(res.body.title).to.equal('Premium - Test Playlist 2345')
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')
          chaiExpect(res.body.episodes).to.eql([])
          chaiExpect(res.body.mediaRefs).to.eql([])

          chaiExpect(res.body.owner.id).to.equal('QMReJmbE')
          chaiExpect(res.body.owner).to.not.have.property('isPublic') 
          chaiExpect(res.body.owner).to.not.have.property('name')

          chaiExpect(Object.keys(res.body).length).to.equal(12)

          done()
        })
    })
  })

  describe('playlist delete', () => {

    test('when the user is not logged in', async (done) => {
      chai.request(global.app)
        .delete(`${v1Path}/playlist/${newPlaylistId}`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)

          chaiExpect(Object.keys(res.body).length).to.equal(0)

          done()
        })
    })
    test('when the user is logged in', async (done) => {
      chai.request(global.app)
        .delete(`${v1Path}/playlist/${newPlaylistId}`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          chaiExpect(Object.keys(res.body).length).to.equal(0)

          done()
        })
    })
  })

  describe('toggle subscribe', () => {

    test('when the user is not logged in', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/playlist/toggle-subscribe/wgOok7Xp`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)

          chaiExpect(Object.keys(res.body).length).to.equal(0)

          done()
        })
    })
    
    test('when the user is logged in: unsubscribe from playlist', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/playlist/toggle-subscribe/wgOok7Xp`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          chaiExpect(res.body).to.eql([
            "zXSkVlr7",
          ])

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })

    test('when the user is logged in: subscribe to playlist', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/playlist/toggle-subscribe/wgOok7Xp`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          chaiExpect(res.body).to.eql([
            "zXSkVlr7",
            "wgOok7Xp"
          ])

          chaiExpect(Object.keys(res.body).length).to.equal(2)

          done()
        })
    })
  })

  describe('find by query subscribed', () => {

    test('Top past week - Invalid user', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/playlist/subscribed?page=1&sort=top-past-week`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)

          chaiExpect(Object.keys(res.body).length).to.equal(0)

          done()
        })
    })

    test('Top past week - Premium Valid', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/playlist/subscribed?page=1&sort=top-past-week`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          const podcast0 = res.body[0]

          chaiExpect(podcast0.id).to.equal('wgOok7Xp')
          chaiExpect(podcast0).to.have.property('description')
          chaiExpect(podcast0.isPublic).to.equal(false)
          chaiExpect(podcast0.itemCount).to.equal(9)
          chaiExpect(podcast0.itemsOrder).to.eql([])
          chaiExpect(podcast0.title).to.equal('Free Trial - Test Playlist 1')
          chaiExpect(podcast0).to.have.property('createdAt')
          chaiExpect(podcast0).to.have.property('updatedAt')
          chaiExpect(podcast0.owner.id).to.equal('EVHDBRZY')
          chaiExpect(podcast0.owner.name).to.equal('Free Trial Valid - Test User')

          const podcast1 = res.body[1]

          chaiExpect(podcast1.id).to.equal('zXSkVlr7')
          chaiExpect(podcast1).to.have.property('description')
          chaiExpect(podcast1.isPublic).to.equal(false)
          chaiExpect(podcast1.itemCount).to.equal(4)
          chaiExpect(podcast1.itemsOrder).to.eql([])
          chaiExpect(podcast1.title).to.equal('Free Trial - Test Playlist 2')
          chaiExpect(podcast1).to.have.property('createdAt')
          chaiExpect(podcast1).to.have.property('updatedAt')
          chaiExpect(podcast1.owner.id).to.equal('EVHDBRZY')
          chaiExpect(podcast1.owner.name).to.equal('Free Trial Valid - Test User')

          chaiExpect(Object.keys(res.body).length).to.equal(2)

          done()
        })
    })
    
  })
})
