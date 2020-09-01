import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_feedUrl endpoints', () => {

  describe('get by id', () => {
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/feedUrl/JCldU-ll`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body.id).to.equal('JCldU-ll')
          chaiExpect(res.body.isAuthority).to.equal(true)
          chaiExpect(res.body.url).to.equal('http://feeds.megaphone.fm/wethepeoplelive')
          chaiExpect(res.body.createdAt).to.equal('2020-03-02T21:15:50.414Z')
          chaiExpect(res.body.updatedAt).to.equal('2020-03-02T21:17:07.154Z')


          const podcast = res.body.podcast
          chaiExpect(podcast.id).to.equal('Q_QCTJbNR')
          chaiExpect(podcast.alwaysFullyParse).to.equal(false)
          chaiExpect(podcast.authorityId).to.equal(null)
          chaiExpect(podcast).to.have.property('description')
          chaiExpect(podcast.feedLastParseFailed).to.equal(false)
          chaiExpect(podcast.feedLastUpdated).to.equal('2018-12-14T23:00:00.000Z')
          chaiExpect(podcast.guid).to.equal(null)
          chaiExpect(podcast.hideDynamicAdsWarning).to.equal(false)
          chaiExpect(podcast.imageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/T1-cdD07uD/wethepeoplelive.jpg')
          chaiExpect(podcast.isExplicit).to.equal(false)
          chaiExpect(podcast.isPublic).to.equal(true)
          chaiExpect(podcast.language).to.equal('en-us')
          chaiExpect(podcast.lastEpisodePubDate).to.equal('2018-12-14T23:00:00.000Z')
          chaiExpect(podcast.lastEpisodeTitle).to.equal('EP 139. IS THE USA UNDEMOCRATIC?')
          chaiExpect(podcast.linkUrl).to.equal('http://panoply.fm/podcasts/wethepeoplelive')
          chaiExpect(podcast.pastAllTimeTotalUniquePageviews).to.equal(0)
          chaiExpect(podcast.pastHourTotalUniquePageviews).to.equal(0)
          chaiExpect(podcast.pastDayTotalUniquePageviews).to.equal(0)
          chaiExpect(podcast.pastWeekTotalUniquePageviews).to.equal(0)
          chaiExpect(podcast.pastMonthTotalUniquePageviews).to.equal(0)
          chaiExpect(podcast.pastYearTotalUniquePageviews).to.equal(0)
          chaiExpect(podcast.shrunkImageUrl).to.equal(null)
          chaiExpect(podcast.sortableTitle).to.equal('wethepeople live')
          chaiExpect(podcast.title).to.equal('#WeThePeople LIVE')
          chaiExpect(podcast.type).to.equal('episodic')
          chaiExpect(podcast.createdAt).to.equal('2020-03-02T21:17:06.893Z')
          chaiExpect(podcast.updatedAt).to.equal('2020-03-02T21:17:06.893Z')
          
          
          

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/feedUrl/JCldewarsfU-ll`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.equal('FeedUrl not found')
         
          

          done()
        })
    })
  })

  describe('find by query', () => {
    test('top past week', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/feedUrl?page=1&sort=top-past-week`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          const feedUrl = res.body[0]
          
          chaiExpect(feedUrl.id).to.equal('JCldU-ll')
          chaiExpect(feedUrl.isAuthority).to.equal(true)
          chaiExpect(feedUrl.url).to.equal('http://feeds.megaphone.fm/wethepeoplelive')
          chaiExpect(feedUrl.createdAt).to.equal('2020-03-02T21:15:50.414Z')
          chaiExpect(feedUrl.updatedAt).to.equal('2020-03-02T21:17:07.154Z')

          chaiExpect(feedUrl.podcast.id).to.equal('Q_QCTJbNR')
          chaiExpect(feedUrl.podcast.alwaysFullyParse).to.equal(false)
          chaiExpect(feedUrl.podcast.authorityId).to.equal(null)
          chaiExpect(feedUrl.podcast).to.have.property('description')
          chaiExpect(feedUrl.podcast.feedLastParseFailed).to.equal(false)
          chaiExpect(feedUrl.podcast.feedLastUpdated).to.equal('2018-12-14T23:00:00.000Z')
          chaiExpect(feedUrl.podcast.guid).to.equal(null)
          chaiExpect(feedUrl.podcast.hideDynamicAdsWarning).to.equal(false)
          chaiExpect(feedUrl.podcast.imageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/T1-cdD07uD/wethepeoplelive.jpg')
          chaiExpect(feedUrl.podcast.isExplicit).to.equal(false)
          chaiExpect(feedUrl.podcast.isPublic).to.equal(true)
          chaiExpect(feedUrl.podcast.language).to.equal('en-us')
          chaiExpect(feedUrl.podcast.lastEpisodePubDate).to.equal('2018-12-14T23:00:00.000Z')
          chaiExpect(feedUrl.podcast.lastEpisodeTitle).to.equal('EP 139. IS THE USA UNDEMOCRATIC?')
          chaiExpect(feedUrl.podcast.linkUrl).to.equal('http://panoply.fm/podcasts/wethepeoplelive')
          chaiExpect(feedUrl.podcast.pastAllTimeTotalUniquePageviews).to.equal(0)
          chaiExpect(feedUrl.podcast.pastHourTotalUniquePageviews).to.equal(0)
          chaiExpect(feedUrl.podcast.pastDayTotalUniquePageviews).to.equal(0)
          chaiExpect(feedUrl.podcast.pastWeekTotalUniquePageviews).to.equal(0)
          chaiExpect(feedUrl.podcast.pastMonthTotalUniquePageviews).to.equal(0)
          chaiExpect(feedUrl.podcast.pastYearTotalUniquePageviews).to.equal(0)
          chaiExpect(feedUrl.podcast.shrunkImageUrl).to.equal(null)
          chaiExpect(feedUrl.podcast.sortableTitle).to.equal('wethepeople live')
          chaiExpect(feedUrl.podcast.title).to.equal('#WeThePeople LIVE')
          chaiExpect(feedUrl.podcast.type).to.equal('episodic')
          chaiExpect(feedUrl.podcast.createdAt).to.equal('2020-03-02T21:17:06.893Z')
          chaiExpect(feedUrl.podcast.updatedAt).to.equal('2020-03-02T21:17:06.893Z')
          

          

          done()
        })
    })
  })

})
