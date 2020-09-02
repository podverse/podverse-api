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
            chaiExpect(queueItem).to.have.property('episodePubDate')
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

            const queueItem = res.body[0][0]

            chaiExpect(queueItem.id).to.equal('fgmGHz0o')
            chaiExpect(queueItem.endTime).to.equal(7380)
            chaiExpect(queueItem.isPublic).to.equal(true)
            chaiExpect(queueItem.pastHourTotalUniquePageviews).to.equal(5)
            chaiExpect(queueItem.pastDayTotalUniquePageviews).to.equal(6)
            chaiExpect(queueItem.pastWeekTotalUniquePageviews).to.equal(7)
            chaiExpect(queueItem.pastMonthTotalUniquePageviews).to.equal(8)
            chaiExpect(queueItem.pastYearTotalUniquePageviews).to.equal(9)
            chaiExpect(queueItem.pastAllTimeTotalUniquePageviews).to.equal(7)
            chaiExpect(queueItem.startTime).to.equal(7200)
            chaiExpect(queueItem.title).to.equal('Non tellus orci ac auctor augue mauris augue neque. Aliquet risus feugiat in ante metus dictum at tempor. Vehicula ipsum a arcu cursus vitae congue mauris rhoncus.')
            chaiExpect(queueItem).to.have.property('createdAt')
            chaiExpect(queueItem).to.have.property('updatedAt')

            chaiExpect(queueItem.episode.id).to.equal('z3kazYivU')
            chaiExpect(queueItem.episode).to.have.property('description')
            chaiExpect(queueItem.episode.duration).to.equal(0)
            chaiExpect(queueItem.episode.episodeType).to.equal('full')
            chaiExpect(queueItem.episode.guid).to.equal('67fec643-473d-48b4-b888-e5ee619600b3')
            chaiExpect(queueItem.episode.imageUrl).to.equal('http://static.libsyn.com/p/assets/c/6/c/7/c6c723c38fb853b1/JRE1428.jpg')
            chaiExpect(queueItem.episode.isExplicit).to.equal(false)
            chaiExpect(queueItem.episode.isPublic).to.equal(true)
            chaiExpect(queueItem.episode.linkUrl).to.equal(null)
            chaiExpect(queueItem.episode.mediaFilesize).to.equal(0)
            chaiExpect(queueItem.episode.mediaType).to.equal('audio/mpeg')
            chaiExpect(queueItem.episode.mediaUrl).to.equal('http://traffic.libsyn.com/joeroganexp/p1428.mp3?dest-id=19997')
            chaiExpect(queueItem.episode.pastHourTotalUniquePageviews).to.equal(1)
            chaiExpect(queueItem.episode.pastDayTotalUniquePageviews).to.equal(2)
            chaiExpect(queueItem.episode.pastWeekTotalUniquePageviews).to.equal(3)
            chaiExpect(queueItem.episode.pastMonthTotalUniquePageviews).to.equal(4)
            chaiExpect(queueItem.episode.pastYearTotalUniquePageviews).to.equal(5)
            chaiExpect(queueItem.episode.pastAllTimeTotalUniquePageviews).to.equal(6)
            chaiExpect(queueItem.episode).to.have.property('pubDate')
            chaiExpect(queueItem.episode.title).to.equal('#1428 - Brian Greene')
            chaiExpect(queueItem.episode.podcastId).to.equal('yKyjZDxsB')
            chaiExpect(queueItem.episode).to.have.property('createdAt')
            chaiExpect(queueItem.episode).to.have.property('updatedAt')

            chaiExpect(queueItem.episode.podcast.id).to.equal('yKyjZDxsB')
            chaiExpect(queueItem.episode.podcast.alwaysFullyParse).to.equal(false)
            chaiExpect(queueItem.episode.podcast.authorityId).to.equal(null)
            chaiExpect(queueItem.episode.podcast.description).to.equal('The podcast of Comedian Joe Rogan..')
            chaiExpect(queueItem.episode.podcast.feedLastParseFailed).to.equal(false)
            chaiExpect(queueItem.episode.podcast).to.have.property('feedLastUpdated')
            chaiExpect(queueItem.episode.podcast.guid).to.equal(null)
            chaiExpect(queueItem.episode.podcast.hideDynamicAdsWarning).to.equal(false)
            chaiExpect(queueItem.episode.podcast.imageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/o6kgywuwTA/thejoeroganexperience.jpg')
            chaiExpect(queueItem.episode.podcast.isExplicit).to.equal(true)
            chaiExpect(queueItem.episode.podcast.isPublic).to.equal(true)
            chaiExpect(queueItem.episode.podcast.language).to.equal('en-us')
            chaiExpect(queueItem.episode.podcast).to.have.property('lastEpisodePubDate')
            chaiExpect(queueItem.episode.podcast.lastEpisodeTitle).to.equal('#1452 - Greg Fitzsimmons')
            chaiExpect(queueItem.episode.podcast.linkUrl).to.equal('https://www.joerogan.com')
            chaiExpect(queueItem.episode.podcast.pastAllTimeTotalUniquePageviews).to.equal(0)
            chaiExpect(queueItem.episode.podcast.pastHourTotalUniquePageviews).to.equal(0)
            chaiExpect(queueItem.episode.podcast.pastDayTotalUniquePageviews).to.equal(0)
            chaiExpect(queueItem.episode.podcast.pastWeekTotalUniquePageviews).to.equal(0)
            chaiExpect(queueItem.episode.podcast.pastMonthTotalUniquePageviews).to.equal(0)
            chaiExpect(queueItem.episode.podcast.pastYearTotalUniquePageviews).to.equal(0)
            chaiExpect(queueItem.episode.podcast.shrunkImageUrl).to.equal(null)
            chaiExpect(queueItem.episode.podcast.sortableTitle).to.equal('joe rogan experience')
            chaiExpect(queueItem.episode.podcast.title).to.equal('The Joe Rogan Experience')
            chaiExpect(queueItem.episode.podcast.type).to.equal('episodic')
            chaiExpect(queueItem.episode.podcast).to.have.property('createdAt')
            chaiExpect(queueItem.episode.podcast).to.have.property('updatedAt')

            done()
          })
      })
    })

    describe('logged-in user: get user mediaRefs', () => {

      test('Logged in', async (done) => {
        chai.request(global.app)
          .get(`${v1Path}/user/mediaRefs`)
          .set('Cookie', testUsers.premium.authCookie)
          .end((err, res) => {
            chaiExpect(res).to.have.status(200)

            const queueItem = res.body[0][0]

            chaiExpect(queueItem.id).to.equal('9rA5BhWp')
            chaiExpect(queueItem.endTime).to.equal(1680)
            chaiExpect(queueItem.isPublic).to.equal(true)
            chaiExpect(queueItem.pastHourTotalUniquePageviews).to.equal(7)
            chaiExpect(queueItem.pastDayTotalUniquePageviews).to.equal(8)
            chaiExpect(queueItem.pastWeekTotalUniquePageviews).to.equal(9)
            chaiExpect(queueItem.pastMonthTotalUniquePageviews).to.equal(0)
            chaiExpect(queueItem.pastYearTotalUniquePageviews).to.equal(1)
            chaiExpect(queueItem.pastAllTimeTotalUniquePageviews).to.equal(2)
            chaiExpect(queueItem.startTime).to.equal(1500)
            chaiExpect(queueItem.title).to.equal('Amet aliquam id diam maecenas ultricies mi eget.')
            chaiExpect(queueItem).to.have.property('createdAt')
            chaiExpect(queueItem).to.have.property('updatedAt')

            chaiExpect(queueItem.episode.id).to.equal('fFmGXkgIM')
            chaiExpect(queueItem.episode).to.have.property('description')
            chaiExpect(queueItem.episode.duration).to.equal(0)
            chaiExpect(queueItem.episode.episodeType).to.equal('full')
            chaiExpect(queueItem.episode.guid).to.equal('465b2bdc-eebd-11e9-85c8-171e42a72b35')
            chaiExpect(queueItem.episode.imageUrl).to.equal(null)
            chaiExpect(queueItem.episode.isExplicit).to.equal(false)
            chaiExpect(queueItem.episode.isPublic).to.equal(true)
            chaiExpect(queueItem.episode.linkUrl).to.equal(null)
            chaiExpect(queueItem.episode.mediaFilesize).to.equal(0)
            chaiExpect(queueItem.episode.mediaType).to.equal('audio/mpeg')
            chaiExpect(queueItem.episode.mediaUrl).to.equal('https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/chtbl.com/track/524GE/traffic.megaphone.fm/VMP3689667624.mp3')
            chaiExpect(queueItem.episode.pastHourTotalUniquePageviews).to.equal(1)
            chaiExpect(queueItem.episode.pastDayTotalUniquePageviews).to.equal(2)
            chaiExpect(queueItem.episode.pastWeekTotalUniquePageviews).to.equal(3)
            chaiExpect(queueItem.episode.pastMonthTotalUniquePageviews).to.equal(4)
            chaiExpect(queueItem.episode.pastYearTotalUniquePageviews).to.equal(5)
            chaiExpect(queueItem.episode.pastAllTimeTotalUniquePageviews).to.equal(6)
            chaiExpect(queueItem.episode).to.have.property('pubDate')
            chaiExpect(queueItem.episode.title).to.equal('Jason Calacanis: TikTok should be banned, Tim Cook doesn\'t have enough \"chutzpah,\" and Uber will be fine')
            chaiExpect(queueItem.episode.podcastId).to.equal('zRo1jwx67')
            chaiExpect(queueItem.episode).to.have.property('createdAt')
            chaiExpect(queueItem.episode).to.have.property('updatedAt')

            chaiExpect(queueItem.episode.podcast.id).to.equal('zRo1jwx67')
            chaiExpect(queueItem.episode.podcast.alwaysFullyParse).to.equal(false)
            chaiExpect(queueItem.episode.podcast.authorityId).to.equal(null)
            chaiExpect(queueItem.episode.podcast).to.have.property('description')
            chaiExpect(queueItem.episode.podcast.feedLastParseFailed).to.equal(false)
            chaiExpect(queueItem.episode.podcast).to.have.property('feedLastUpdated')
            chaiExpect(queueItem.episode.podcast.guid).to.equal(null)
            chaiExpect(queueItem.episode.podcast.hideDynamicAdsWarning).to.equal(false)
            chaiExpect(queueItem.episode.podcast.imageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/-cykCbiMI3/recodedecode.png')
            chaiExpect(queueItem.episode.podcast.isExplicit).to.equal(false)
            chaiExpect(queueItem.episode.podcast.isPublic).to.equal(true)
            chaiExpect(queueItem.episode.podcast.language).to.equal('en-us')
            chaiExpect(queueItem.episode.podcast).to.have.property('lastEpisodePubDate')
            chaiExpect(queueItem.episode.podcast.lastEpisodeTitle).to.equal('Episode 500: Slack CEO Stewart Butterfield on coronavirus, working from home, and Slack\'s redesign')
            chaiExpect(queueItem.episode.podcast.linkUrl).to.equal('https://www.vox.com/recode-decode-podcast-kara-swisher')
            chaiExpect(queueItem.episode.podcast.pastAllTimeTotalUniquePageviews).to.equal(0)
            chaiExpect(queueItem.episode.podcast.pastHourTotalUniquePageviews).to.equal(0)
            chaiExpect(queueItem.episode.podcast.pastDayTotalUniquePageviews).to.equal(0)
            chaiExpect(queueItem.episode.podcast.pastWeekTotalUniquePageviews).to.equal(0)
            chaiExpect(queueItem.episode.podcast.pastMonthTotalUniquePageviews).to.equal(0)
            chaiExpect(queueItem.episode.podcast.pastYearTotalUniquePageviews).to.equal(0)
            chaiExpect(queueItem.episode.podcast.shrunkImageUrl).to.equal(null)
            chaiExpect(queueItem.episode.podcast.sortableTitle).to.equal('recode decode')
            chaiExpect(queueItem.episode.podcast.title).to.equal('Recode Decode')
            chaiExpect(queueItem.episode.podcast.type).to.equal('episodic')
            chaiExpect(queueItem.episode.podcast).to.have.property('createdAt')
            chaiExpect(queueItem.episode.podcast).to.have.property('updatedAt')

            done()
          })
      })
        test('Not logged in', async (done) => {
          chai.request(global.app)
            .get(`${v1Path}/user/mediaRefs`)
            .end((err, res) => {
              chaiExpect(res).to.have.status(401)

              done()
            })
        })
    })

    describe('logged-in user: get user playlists', () => {

      test('Logged in', async (done) => {
        chai.request(global.app)
          .get(`${v1Path}/user/playlists`)
          .set('Cookie', testUsers.premium.authCookie)
          .end((err, res) => {
            chaiExpect(res).to.have.status(200)

            const queueItems = res.body[0]
            const queueItem = queueItems[0]

            chaiExpect(queueItem.id).to.equal('-67KgiG1')
            chaiExpect(queueItem).to.have.property('description')
            chaiExpect(queueItem.isPublic).to.equal(false)
            chaiExpect(queueItem.itemCount).to.equal(6)
            chaiExpect(queueItem.itemsOrder).to.eql([])
            chaiExpect(queueItem.title).to.equal('Premium - Test Playlist 1')
            chaiExpect(queueItem).to.have.property('createdAt')
            chaiExpect(queueItem).to.have.property('updatedAt')

            chaiExpect(queueItem.owner.id).to.equal('QMReJmbE')
            chaiExpect(queueItem.owner).to.not.have.property('isPublic')
            chaiExpect(queueItem.owner).to.not.have.property('name')

            chaiExpect(queueItems[1].id).to.equal('CH_2-LlM')
            chaiExpect(queueItems[1]).to.have.property('description')
            chaiExpect(queueItems[1].isPublic).to.equal(false)
            chaiExpect(queueItems[1].itemCount).to.equal(2)
            chaiExpect(queueItems[1].itemsOrder).to.eql([])
            chaiExpect(queueItems[1].title).to.equal('Premium - Test Playlist 2')
            chaiExpect(queueItems[1]).to.have.property('createdAt')
            chaiExpect(queueItems[1]).to.have.property('updatedAt')

            chaiExpect(queueItems[1].owner.id).to.equal('QMReJmbE')
            chaiExpect(queueItem.owner).to.not.have.property('isPublic')
            chaiExpect(queueItem.owner).to.not.have.property('name')
            
            done()
          })
      })

      test('Not logged in', async (done) => {
        chai.request(global.app)
          .get(`${v1Path}/user/playlists`)
          .end((err, res) => {
            chaiExpect(res).to.have.status(401)

            done()
          })
      })
    })

    describe('Download user data', () => {
      test('Logged in', async (done) => {
        chai.request(global.app)
          .get(`${v1Path}/user/download`)
          .set('Cookie', testUsers.premium.authCookie)
          .end((err, res) => {

            chaiExpect(res).to.have.status(200);
           
            done()
          })
      })

      test('Not logged in', async (done) => {
        chai.request(global.app)
          .get(`${v1Path}/user/download`)
          .end((err, res) => {
            chaiExpect(res).to.have.status(401);

            done()
          })
      })
    })

    describe('Find public users by query', () => {
      test('find 3 users', async (done) => {
        chai.request(global.app)
          .get(`${v1Path}/user?userIds=bvVjsQCH,oAbPPRF9,EVHDBRZY`)
          .set('Cookie', testUsers.premium.authCookie)
          .end((err, res) => {

            chaiExpect(res).to.have.status(200);

            const queueItems = res.body[0]
            const queueItem = queueItems[0]

            chaiExpect(queueItem.id).to.equal('bvVjsQCH')
            chaiExpect(queueItem.name).to.equal('Free Trial Expired - Test User')

            chaiExpect(queueItems[1].id).to.equal('EVHDBRZY')
            chaiExpect(queueItems[1].name).to.equal('Free Trial Valid - Test User')

            chaiExpect(queueItems[2].id).to.equal('oAbPPRF9')
            chaiExpect(queueItems[2].name).to.equal('Premium Expired - Test User')

           
            done()
          })
      })
    })

    

})
