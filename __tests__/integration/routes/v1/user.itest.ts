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
      
      test('when the user is logged in', async (done) => {
        chai.request(global.app)
          .patch(`${v1Path}/user`)
          .set('Cookie', testUsers.premium.authCookie)
          .send(sendBody)
          .end((err, res) => {
            chaiExpect(res).to.have.status(200)

            chaiExpect(res.body).to.eql(sendBody)

            done()
          })
      })
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

    describe('toggle subscribe', () => {

      test('when the user is not logged in', async (done) => {
        chai.request(global.app)
          .get(`${v1Path}/user/toggle-subscribe/:id`)
          .send('EVHDBRZY')
          .end((err, res) => {
            chaiExpect(res).to.have.status(401)

            done()
          })
      })
      
      test('when the user is logged in: subscribe to user', async (done) => {
        chai.request(global.app)
          .get(`${v1Path}/user/toggle-subscribe/EVHDBRZY`)
          .set('Cookie', testUsers.premium.authCookie)
          .end((err, res) => {
            chaiExpect(res).to.have.status(200)

            chaiExpect(res.body).to.eql([
              "bvVjsQCH",
              "oAbPPRF9"
            ])

            done()
          })
      })

      test('when the user is logged in: unsubscribe from user', async (done) => {
        chai.request(global.app)
          .get(`${v1Path}/user/toggle-subscribe/EVHDBRZY`)
          .set('Cookie', testUsers.premium.authCookie)
          .end((err, res) => {
            chaiExpect(res).to.have.status(200)

            chaiExpect(res.body).to.eql([
              "bvVjsQCH",
              "oAbPPRF9",
              "EVHDBRZY"
            ])

            done()
          })
      })
    })

    describe('get mediaRefs', () => {

      test('id: bvVjsQCH', async (done) => {
        chai.request(global.app)
          .get(`${v1Path}/user/bvVjsQCH/mediaRefs`)
          .end((err, res) => {
            chaiExpect(res).to.have.status(200)

            chaiExpect(res.body[0][0].id).to.equal('fgmGHz0o')
            chaiExpect(res.body[0][0].endTime).to.equal(7380)
            chaiExpect(res.body[0][0].isPublic).to.equal(true)
            chaiExpect(res.body[0][0].pastHourTotalUniquePageviews).to.equal(5)
            chaiExpect(res.body[0][0].pastDayTotalUniquePageviews).to.equal(6)
            chaiExpect(res.body[0][0].pastWeekTotalUniquePageviews).to.equal(7)
            chaiExpect(res.body[0][0].pastMonthTotalUniquePageviews).to.equal(8)
            chaiExpect(res.body[0][0].pastYearTotalUniquePageviews).to.equal(9)
            chaiExpect(res.body[0][0].pastAllTimeTotalUniquePageviews).to.equal(7)
            chaiExpect(res.body[0][0].startTime).to.equal(7200)
            chaiExpect(res.body[0][0].title).to.equal('Non tellus orci ac auctor augue mauris augue neque. Aliquet risus feugiat in ante metus dictum at tempor. Vehicula ipsum a arcu cursus vitae congue mauris rhoncus.')
            chaiExpect(res.body[0][0].createdAt).to.equal('2020-03-02T22:02:57.865Z')
            chaiExpect(res.body[0][0].updatedAt).to.equal('2020-03-02T23:05:24.052Z')

            chaiExpect(res.body[0][0].episode.id).to.equal('z3kazYivU')
            chaiExpect(res.body[0][0].episode).to.have.property('description')
            chaiExpect(res.body[0][0].episode.duration).to.equal(0)
            chaiExpect(res.body[0][0].episode.episodeType).to.equal('full')
            chaiExpect(res.body[0][0].episode.guid).to.equal('67fec643-473d-48b4-b888-e5ee619600b3')
            chaiExpect(res.body[0][0].episode.imageUrl).to.equal('http://static.libsyn.com/p/assets/c/6/c/7/c6c723c38fb853b1/JRE1428.jpg')
            chaiExpect(res.body[0][0].episode.isExplicit).to.equal(false)
            chaiExpect(res.body[0][0].episode.isPublic).to.equal(true)
            chaiExpect(res.body[0][0].episode.linkUrl).to.equal(null)
            chaiExpect(res.body[0][0].episode.mediaFilesize).to.equal(0)
            chaiExpect(res.body[0][0].episode.mediaType).to.equal('audio/mpeg')
            chaiExpect(res.body[0][0].episode.mediaUrl).to.equal('http://traffic.libsyn.com/joeroganexp/p1428.mp3?dest-id=19997')
            chaiExpect(res.body[0][0].episode.pastHourTotalUniquePageviews).to.equal(1)
            chaiExpect(res.body[0][0].episode.pastDayTotalUniquePageviews).to.equal(2)
            chaiExpect(res.body[0][0].episode.pastWeekTotalUniquePageviews).to.equal(3)
            chaiExpect(res.body[0][0].episode.pastMonthTotalUniquePageviews).to.equal(4)
            chaiExpect(res.body[0][0].episode.pastYearTotalUniquePageviews).to.equal(5)
            chaiExpect(res.body[0][0].episode.pastAllTimeTotalUniquePageviews).to.equal(6)
            chaiExpect(res.body[0][0].episode.pubDate).to.equal('2020-02-19T20:00:00.000Z')
            chaiExpect(res.body[0][0].episode.title).to.equal('#1428 - Brian Greene')
            chaiExpect(res.body[0][0].episode.podcastId).to.equal('yKyjZDxsB')
            chaiExpect(res.body[0][0].episode.createdAt).to.equal('2020-03-02T21:17:08.749Z')
            chaiExpect(res.body[0][0].episode.updatedAt).to.equal('2020-04-03T06:51:11.489Z')

            chaiExpect(res.body[0][0].episode.podcast.id).to.equal('yKyjZDxsB')
            chaiExpect(res.body[0][0].episode.podcast.alwaysFullyParse).to.equal(false)
            chaiExpect(res.body[0][0].episode.podcast.authorityId).to.equal(null)
            chaiExpect(res.body[0][0].episode.podcast.description).to.equal('The podcast of Comedian Joe Rogan..')
            chaiExpect(res.body[0][0].episode.podcast.feedLastParseFailed).to.equal(false)
            chaiExpect(res.body[0][0].episode.podcast.feedLastUpdated).to.equal('2020-04-02T19:00:00.000Z')
            chaiExpect(res.body[0][0].episode.podcast.guid).to.equal(null)
            chaiExpect(res.body[0][0].episode.podcast.hideDynamicAdsWarning).to.equal(false)
            chaiExpect(res.body[0][0].episode.podcast.imageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/o6kgywuwTA/thejoeroganexperience.jpg')
            chaiExpect(res.body[0][0].episode.podcast.isExplicit).to.equal(true)
            chaiExpect(res.body[0][0].episode.podcast.isPublic).to.equal(true)
            chaiExpect(res.body[0][0].episode.podcast.language).to.equal('en-us')
            chaiExpect(res.body[0][0].episode.podcast.lastEpisodePubDate).to.equal('2020-04-02T19:00:00.000Z')
            chaiExpect(res.body[0][0].episode.podcast.lastEpisodeTitle).to.equal('#1452 - Greg Fitzsimmons')
            chaiExpect(res.body[0][0].episode.podcast.linkUrl).to.equal('https://www.joerogan.com')
            chaiExpect(res.body[0][0].episode.podcast.pastAllTimeTotalUniquePageviews).to.equal(0)
            chaiExpect(res.body[0][0].episode.podcast.pastHourTotalUniquePageviews).to.equal(0)
            chaiExpect(res.body[0][0].episode.podcast.pastDayTotalUniquePageviews).to.equal(0)
            chaiExpect(res.body[0][0].episode.podcast.pastWeekTotalUniquePageviews).to.equal(0)
            chaiExpect(res.body[0][0].episode.podcast.pastMonthTotalUniquePageviews).to.equal(0)
            chaiExpect(res.body[0][0].episode.podcast.pastYearTotalUniquePageviews).to.equal(0)
            chaiExpect(res.body[0][0].episode.podcast.shrunkImageUrl).to.equal(null)
            chaiExpect(res.body[0][0].episode.podcast.sortableTitle).to.equal('joe rogan experience')
            chaiExpect(res.body[0][0].episode.podcast.title).to.equal('The Joe Rogan Experience')
            chaiExpect(res.body[0][0].episode.podcast.type).to.equal('episodic')
            chaiExpect(res.body[0][0].episode.podcast.createdAt).to.equal('2020-03-02T21:17:08.665Z')
            chaiExpect(res.body[0][0].episode.podcast.updatedAt).to.equal('2020-04-03T06:51:07.230Z')

            done()
          })
      })
    })

    describe('logged-in user: get mediaRefs', () => {

      test('Logged in', async (done) => {
        chai.request(global.app)
          .get(`${v1Path}/user/mediaRefs`)
          .set('Cookie', testUsers.premium.authCookie)
          .end((err, res) => {
            chaiExpect(res).to.have.status(200)

            chaiExpect(res.body[0][0].id).to.equal('9rA5BhWp')
            chaiExpect(res.body[0][0].endTime).to.equal(1680)
            chaiExpect(res.body[0][0].isPublic).to.equal(true)
            chaiExpect(res.body[0][0].pastHourTotalUniquePageviews).to.equal(7)
            chaiExpect(res.body[0][0].pastDayTotalUniquePageviews).to.equal(8)
            chaiExpect(res.body[0][0].pastWeekTotalUniquePageviews).to.equal(9)
            chaiExpect(res.body[0][0].pastMonthTotalUniquePageviews).to.equal(0)
            chaiExpect(res.body[0][0].pastYearTotalUniquePageviews).to.equal(1)
            chaiExpect(res.body[0][0].pastAllTimeTotalUniquePageviews).to.equal(2)
            chaiExpect(res.body[0][0].startTime).to.equal(1500)
            chaiExpect(res.body[0][0].title).to.equal('Amet aliquam id diam maecenas ultricies mi eget.')
            chaiExpect(res.body[0][0].createdAt).to.equal('2020-03-02T22:37:36.073Z')
            chaiExpect(res.body[0][0].updatedAt).to.equal('2020-03-02T22:58:19.378Z')

            chaiExpect(res.body[0][0].episode.id).to.equal('fFmGXkgIM')
            chaiExpect(res.body[0][0].episode).to.have.property('description')
            chaiExpect(res.body[0][0].episode.duration).to.equal(0)
            chaiExpect(res.body[0][0].episode.episodeType).to.equal('full')
            chaiExpect(res.body[0][0].episode.guid).to.equal('465b2bdc-eebd-11e9-85c8-171e42a72b35')
            chaiExpect(res.body[0][0].episode.imageUrl).to.equal(null)
            chaiExpect(res.body[0][0].episode.isExplicit).to.equal(false)
            chaiExpect(res.body[0][0].episode.isPublic).to.equal(true)
            chaiExpect(res.body[0][0].episode.linkUrl).to.equal(null)
            chaiExpect(res.body[0][0].episode.mediaFilesize).to.equal(0)
            chaiExpect(res.body[0][0].episode.mediaType).to.equal('audio/mpeg')
            chaiExpect(res.body[0][0].episode.mediaUrl).to.equal('https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/chtbl.com/track/524GE/traffic.megaphone.fm/VMP3689667624.mp3')
            chaiExpect(res.body[0][0].episode.pastHourTotalUniquePageviews).to.equal(1)
            chaiExpect(res.body[0][0].episode.pastDayTotalUniquePageviews).to.equal(2)
            chaiExpect(res.body[0][0].episode.pastWeekTotalUniquePageviews).to.equal(3)
            chaiExpect(res.body[0][0].episode.pastMonthTotalUniquePageviews).to.equal(4)
            chaiExpect(res.body[0][0].episode.pastYearTotalUniquePageviews).to.equal(5)
            chaiExpect(res.body[0][0].episode.pastAllTimeTotalUniquePageviews).to.equal(6)
            chaiExpect(res.body[0][0].episode.pubDate).to.equal('2020-03-02T05:01:00.000Z')
            chaiExpect(res.body[0][0].episode.title).to.equal('Jason Calacanis: TikTok should be banned, Tim Cook doesn\'t have enough \"chutzpah,\" and Uber will be fine')
            chaiExpect(res.body[0][0].episode.podcastId).to.equal('zRo1jwx67')
            chaiExpect(res.body[0][0].episode.createdAt).to.equal('2020-03-02T21:17:39.462Z')
            chaiExpect(res.body[0][0].episode.updatedAt).to.equal('2020-04-03T06:52:52.361Z')

            chaiExpect(res.body[0][0].episode.podcast.id).to.equal('zRo1jwx67')
            chaiExpect(res.body[0][0].episode.podcast.alwaysFullyParse).to.equal(false)
            chaiExpect(res.body[0][0].episode.podcast.authorityId).to.equal(null)
            chaiExpect(res.body[0][0].episode.podcast).to.have.property('description')
            chaiExpect(res.body[0][0].episode.podcast.feedLastParseFailed).to.equal(false)
            chaiExpect(res.body[0][0].episode.podcast.feedLastUpdated).to.equal('2020-04-01T04:01:00.000Z')
            chaiExpect(res.body[0][0].episode.podcast.guid).to.equal(null)
            chaiExpect(res.body[0][0].episode.podcast.hideDynamicAdsWarning).to.equal(false)
            chaiExpect(res.body[0][0].episode.podcast.imageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/-cykCbiMI3/recodedecode.png')
            chaiExpect(res.body[0][0].episode.podcast.isExplicit).to.equal(false)
            chaiExpect(res.body[0][0].episode.podcast.isPublic).to.equal(true)
            chaiExpect(res.body[0][0].episode.podcast.language).to.equal('en-us')
            chaiExpect(res.body[0][0].episode.podcast.lastEpisodePubDate).to.equal('2020-04-01T04:01:00.000Z')
            chaiExpect(res.body[0][0].episode.podcast.lastEpisodeTitle).to.equal('Episode 500: Slack CEO Stewart Butterfield on coronavirus, working from home, and Slack\'s redesign')
            chaiExpect(res.body[0][0].episode.podcast.linkUrl).to.equal('https://www.vox.com/recode-decode-podcast-kara-swisher')
            chaiExpect(res.body[0][0].episode.podcast.pastAllTimeTotalUniquePageviews).to.equal(0)
            chaiExpect(res.body[0][0].episode.podcast.pastHourTotalUniquePageviews).to.equal(0)
            chaiExpect(res.body[0][0].episode.podcast.pastDayTotalUniquePageviews).to.equal(0)
            chaiExpect(res.body[0][0].episode.podcast.pastWeekTotalUniquePageviews).to.equal(0)
            chaiExpect(res.body[0][0].episode.podcast.pastMonthTotalUniquePageviews).to.equal(0)
            chaiExpect(res.body[0][0].episode.podcast.pastYearTotalUniquePageviews).to.equal(0)
            chaiExpect(res.body[0][0].episode.podcast.shrunkImageUrl).to.equal(null)
            chaiExpect(res.body[0][0].episode.podcast.sortableTitle).to.equal('recode decode')
            chaiExpect(res.body[0][0].episode.podcast.title).to.equal('Recode Decode')
            chaiExpect(res.body[0][0].episode.podcast.type).to.equal('episodic')
            chaiExpect(res.body[0][0].episode.podcast.createdAt).to.equal('2020-03-02T21:17:39.426Z')
            chaiExpect(res.body[0][0].episode.podcast.updatedAt).to.equal('2020-04-03T06:52:51.657Z')

            done()
          })
      })
        test('Logged in', async (done) => {
          chai.request(global.app)
            .get(`${v1Path}/user/mediaRefs`)
            .end((err, res) => {
              chaiExpect(res).to.have.status(401)

              done()
            })
        })
    })

})
