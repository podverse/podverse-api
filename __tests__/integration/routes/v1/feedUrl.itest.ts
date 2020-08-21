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
          chaiExpect(res.body).to.have.property('id', 'JCldU-ll')
          chaiExpect(res.body).to.have.property('isAuthority', true)
          chaiExpect(res.body).to.have.property('url', 'http://feeds.megaphone.fm/wethepeoplelive')
          chaiExpect(res.body).to.have.property('createdAt', '2020-03-02T21:15:50.414Z')
          chaiExpect(res.body).to.have.property('updatedAt', '2020-03-02T21:17:07.154Z')


          const podcast = res.body.podcast
          chaiExpect(podcast).to.have.property('id', 'Q_QCTJbNR')
          chaiExpect(podcast).to.have.property('alwaysFullyParse', false)
          chaiExpect(podcast).to.have.property('authorityId', null)
          chaiExpect(podcast).to.have.property('description')
          chaiExpect(podcast).to.have.property('feedLastParseFailed', false)
          chaiExpect(podcast).to.have.property('feedLastUpdated', '2018-12-14T23:00:00.000Z')
          chaiExpect(podcast).to.have.property('guid', null)
          chaiExpect(podcast).to.have.property('hideDynamicAdsWarning', false)
          chaiExpect(podcast).to.have.property('imageUrl', 'https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/T1-cdD07uD/wethepeoplelive.jpg')
          chaiExpect(podcast).to.have.property('isExplicit', false)
          chaiExpect(podcast).to.have.property('isPublic', true)
          chaiExpect(podcast).to.have.property('language', 'en-us')
          chaiExpect(podcast).to.have.property('lastEpisodePubDate', '2018-12-14T23:00:00.000Z')
          chaiExpect(podcast).to.have.property('lastEpisodeTitle', 'EP 139. IS THE USA UNDEMOCRATIC?')
          chaiExpect(podcast).to.have.property('linkUrl', 'http://panoply.fm/podcasts/wethepeoplelive')
          chaiExpect(podcast).to.have.property('pastAllTimeTotalUniquePageviews', 0)
          chaiExpect(podcast).to.have.property('pastHourTotalUniquePageviews', 0)
          chaiExpect(podcast).to.have.property('pastDayTotalUniquePageviews', 0)
          chaiExpect(podcast).to.have.property('pastWeekTotalUniquePageviews', 0)
          chaiExpect(podcast).to.have.property('pastMonthTotalUniquePageviews', 0)
          chaiExpect(podcast).to.have.property('pastYearTotalUniquePageviews', 0)
          chaiExpect(podcast).to.have.property('shrunkImageUrl', null)
          chaiExpect(podcast).to.have.property('sortableTitle', 'wethepeople live')
          chaiExpect(podcast).to.have.property('title', '#WeThePeople LIVE')
          chaiExpect(podcast).to.have.property('type', 'episodic')
          chaiExpect(podcast).to.have.property('createdAt', '2020-03-02T21:17:06.893Z')
          chaiExpect(podcast).to.have.property('updatedAt', '2020-03-02T21:17:06.893Z')
          
          
          

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/feedUrl/JCldewarsfU-ll`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body).to.have.property('message', 'FeedUrl not found')
         
          

          done()
        })
    })
  })

})
