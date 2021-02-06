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
          chaiExpect(res.body.imageUrl).to.equal(null)
          chaiExpect(res.body.isOfficialChapter).to.equal(false)
          chaiExpect(res.body.isOfficialSoundBite).to.equal(false)
          chaiExpect(res.body.isPublic).to.equal(true)
          chaiExpect(res.body.linkUrl).to.equal(null)
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
          chaiExpect(Object.keys(res.body).length).to.equal(22)
          

          const episode = res.body.episode
          chaiExpect(episode.id).to.equal('fFmGXkgIM')
          chaiExpect(episode.chaptersType).to.equal(null)
          chaiExpect(episode.chaptersUrl).to.equal(null)
          chaiExpect(episode.chaptersUrlLastParsed).to.equal(null)
          chaiExpect(episode).to.have.property('description')
          chaiExpect(episode.duration).to.equal(0)
          chaiExpect(episode.episodeType).to.equal('full')
          chaiExpect(episode.funding).to.equal(null)
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

          const podcast = res.body.episode.podcast
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

          const authors = res.body.episode.podcast.authors[0]
          chaiExpect(authors.id).to.equal('9dZ9IY9j')
          chaiExpect(authors.name).to.equal('Recode')
          chaiExpect(authors.slug).to.equal('recode')
          chaiExpect(authors).to.have.property('createdAt')
          chaiExpect(authors).to.have.property('updatedAt')

          const categories = res.body.episode.podcast.categories[0]
          chaiExpect(categories.id).to.equal('qLzItpcUGch')
          chaiExpect(categories.fullPath).to.equal('Technology')
          chaiExpect(categories.slug).to.equal('technology')
          chaiExpect(categories.title).to.equal('Technology')
          chaiExpect(categories).to.have.property('createdAt')
          chaiExpect(categories).to.have.property('updatedAt')

          const feedUrls = res.body.episode.podcast.feedUrls[0]
          chaiExpect(feedUrls.id).to.equal('qpvTtcUBQh')
          chaiExpect(feedUrls.isAuthority).to.equal(true)
          chaiExpect(feedUrls.url).to.equal('https://feeds.megaphone.fm/recodedecode')
          chaiExpect(feedUrls).to.have.property('createdAt')
          chaiExpect(feedUrls).to.have.property('updatedAt')

          const owner = res.body.owner
          chaiExpect(owner.id).to.equal('QMReJmbE')
          chaiExpect(owner.isPublic).to.equal(true)
          chaiExpect(owner.name).to.equal('Premium Valid - Test User')

          chaiExpect(Object.keys(res.body).length).to.equal(22)

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/mediaRef/9rA5BasdfhWp`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.equal('MediaRef not found')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

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
          chaiExpect(Object.keys(res.body).length).to.equal(0)
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
          chaiExpect(res.body.imageUrl).to.equal(null)
          chaiExpect(res.body.linkUrl).to.equal(null)
          chaiExpect(res.body.isOfficialChapter).to.equal(false)
          chaiExpect(res.body.isOfficialSoundBite).to.equal(false)
          chaiExpect(res.body.pastHourTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastDayTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastWeekTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastMonthTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastYearTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastAllTimeTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')

          chaiExpect(Object.keys(res.body).length).to.equal(22)

          done()
        })
    })

    test('Delete: when the user is not logged in', async (done) => {
      chai.request(global.app)
        .delete(`${v1Path}/mediaRef/${newMediaRefId}`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)
          chaiExpect(Object.keys(res.body).length).to.equal(0)
          done()
        })
    })

    test('Delete: when the user is logged in', async (done) => {
      chai.request(global.app)
        .delete(`${v1Path}/mediaRef/${newMediaRefId}`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)
          chaiExpect(Object.keys(res.body).length).to.equal(0)
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
          const mediaRef0 = mediaRefs[0]
          
          chaiExpect(mediaRef0.id).to.equal('fgmGHz0o')
          chaiExpect(mediaRef0.int_id).to.equal(41)
          chaiExpect(mediaRef0.endTime).to.equal(7380)
          chaiExpect(mediaRef0.imageUrl).to.equal(null)
          chaiExpect(mediaRef0.isOfficialChapter).to.equal(false)
          chaiExpect(mediaRef0.isOfficialSoundBite).to.equal(false)
          chaiExpect(mediaRef0.isPublic).to.equal(true)
          chaiExpect(mediaRef0.linkUrl).to.equal(null)
          chaiExpect(mediaRef0.pastHourTotalUniquePageviews).to.equal(123456789)
          chaiExpect(mediaRef0.pastDayTotalUniquePageviews).to.equal(123456789)
          chaiExpect(mediaRef0.pastWeekTotalUniquePageviews).to.equal(123456789)
          chaiExpect(mediaRef0.pastMonthTotalUniquePageviews).to.equal(123456789)
          chaiExpect(mediaRef0.pastYearTotalUniquePageviews).to.equal(123456789)
          chaiExpect(mediaRef0.pastAllTimeTotalUniquePageviews).to.equal(123456789)
          chaiExpect(mediaRef0.startTime).to.equal(7200)
          chaiExpect(mediaRef0.title).to.equal('Non tellus orci ac auctor augue mauris augue neque. Aliquet risus feugiat in ante metus dictum at tempor. Vehicula ipsum a arcu cursus vitae congue mauris rhoncus.')
          chaiExpect(mediaRef0).to.have.property('createdAt')
          chaiExpect(mediaRef0).to.have.property('updatedAt')
          
          chaiExpect(mediaRef0.owner.id).to.equal('bvVjsQCH')
          chaiExpect(mediaRef0.owner.isPublic).to.equal(true)
          chaiExpect(mediaRef0.owner).to.have.property('name')

          const mediaRef1 = mediaRefs[1]
          chaiExpect(mediaRef1.id).to.equal('uqBhM4ml')

          const mediaRef2 = mediaRefs[2]
          chaiExpect(mediaRef2.id).to.equal('U1CrtU3M')

          const mediaRef3 = mediaRefs[3]
          chaiExpect(mediaRef3.id).to.equal('9rA5BhWp')


          chaiExpect(Object.keys(res.body).length).to.equal(2)

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

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

})
