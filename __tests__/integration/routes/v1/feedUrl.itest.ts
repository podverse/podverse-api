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
          chaiExpect(res.body.id).to.eql('JCldU-ll')
          chaiExpect(res.body.isAuthority).to.eql(true)
          chaiExpect(res.body.url).to.eql('http://feeds.megaphone.fm/wethepeoplelive')
          chaiExpect(res.body.createdAt).to.eql('2020-03-02T21:15:50.414Z')
          chaiExpect(res.body.updatedAt).to.eql('2020-03-02T21:17:07.154Z')


          const podcast = res.body.podcast
          chaiExpect(podcast.id).to.eql('Q_QCTJbNR')
          chaiExpect(podcast.alwaysFullyParse).to.eql(false)
          chaiExpect(podcast.authorityId).to.eql(null)
          chaiExpect(podcast).to.have.property('description')
          chaiExpect(podcast.feedLastParseFailed).to.eql(false)
          chaiExpect(podcast.feedLastUpdated).to.eql('2018-12-14T23:00:00.000Z')
          chaiExpect(podcast.guid).to.eql(null)
          chaiExpect(podcast.hideDynamicAdsWarning).to.eql(false)
          chaiExpect(podcast.imageUrl).to.eql('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/T1-cdD07uD/wethepeoplelive.jpg')
          chaiExpect(podcast.isExplicit).to.eql(false)
          chaiExpect(podcast.isPublic).to.eql(true)
          chaiExpect(podcast.language).to.eql('en-us')
          chaiExpect(podcast.lastEpisodePubDate).to.eql('2018-12-14T23:00:00.000Z')
          chaiExpect(podcast.lastEpisodeTitle).to.eql('EP 139. IS THE USA UNDEMOCRATIC?')
          chaiExpect(podcast.linkUrl).to.eql('http://panoply.fm/podcasts/wethepeoplelive')
          chaiExpect(podcast.pastAllTimeTotalUniquePageviews).to.eql(0)
          chaiExpect(podcast.pastHourTotalUniquePageviews).to.eql(0)
          chaiExpect(podcast.pastDayTotalUniquePageviews).to.eql(0)
          chaiExpect(podcast.pastWeekTotalUniquePageviews).to.eql(0)
          chaiExpect(podcast.pastMonthTotalUniquePageviews).to.eql(0)
          chaiExpect(podcast.pastYearTotalUniquePageviews).to.eql(0)
          chaiExpect(podcast.shrunkImageUrl).to.eql(null)
          chaiExpect(podcast.sortableTitle).to.eql('wethepeople live')
          chaiExpect(podcast.title).to.eql('#WeThePeople LIVE')
          chaiExpect(podcast.type).to.eql('episodic')
          chaiExpect(podcast.createdAt).to.eql('2020-03-02T21:17:06.893Z')
          chaiExpect(podcast.updatedAt).to.eql('2020-03-02T21:17:06.893Z')
          
          
          

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/feedUrl/JCldewarsfU-ll`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.eql('FeedUrl not found')
         
          

          done()
        })
    })
  })

})
