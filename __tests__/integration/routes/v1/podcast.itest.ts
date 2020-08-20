import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_podcast endpoints', () => {

  describe('get by id', () => {
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/mN25xFjDG`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body).to.have.property('id', 'mN25xFjDG')
          chaiExpect(res.body).to.have.property('alwaysFullyParse', false)
          chaiExpect(res.body).to.have.property('authorityId', null)
          chaiExpect(res.body).to.have.property('description')
          chaiExpect(res.body).to.have.property('feedLastParseFailed', false)
          chaiExpect(res.body).to.have.property('feedLastUpdated', '2020-03-30T20:27:19.000Z')
          chaiExpect(res.body).to.have.property('guid', null)
          chaiExpect(res.body).to.have.property('hideDynamicAdsWarning', false)
          chaiExpect(res.body).to.have.property('imageUrl', 'https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/SfjLyq3660/duncantrussellfamilyhour.jpg')
          chaiExpect(res.body).to.have.property('isExplicit', true)
          chaiExpect(res.body).to.have.property('isPublic', true)
          chaiExpect(res.body).to.have.property('language', 'en-us')
          chaiExpect(res.body).to.have.property('lastEpisodePublishDate', '2020-03-30T20:24:14.000Z')
          chaiExpect(res.body).to.have.property('lastEpisodeTitle', '378: David Nichtern')
          chaiExpect(res.body).to.have.property('linkUrl', 'http://www.duncantrussell.com/')
          chaiExpect(res.body).to.have.property('pastAllTimeTotalUniquePageviews', 0)
          chaiExpect(res.body).to.have.property('pastHourTotalUniquePageviews', 0)
          chaiExpect(res.body).to.have.property('pastDayTotalUniquePageviews', 0)
          chaiExpect(res.body).to.have.property('pastWeekTotalUniquePageviews', 0)
          chaiExpect(res.body).to.have.property('pastMonthTotalUniquePageviews', 0)
          chaiExpect(res.body).to.have.property('pastYearTotalUniquePageviews', 0)
          chaiExpect(res.body).to.have.property('shrunkImageUrl', null)
          chaiExpect(res.body).to.have.property('sortableTitle', 'duncan trussell family hour')
          chaiExpect(res.body).to.have.property('title', 'Duncan Trussell Family Hour')
          chaiExpect(res.body).to.have.property('type', 'episodic')
          chaiExpect(res.body).to.have.property('createdAt', '2020-03-02T21:17:12.363Z')
          chaiExpect(res.body).to.have.property('updatedAt', '2020-04-03T06:50:58.279Z')


          const author = res.body.authors[0]
          chaiExpect(author).to.have.property('id', 'uS56AylX')
          chaiExpect(author).to.have.property('name', 'Duncan Trussell Family Hour')
          chaiExpect(author).to.have.property('slug', 'duncantrussellfamilyhour')
          chaiExpect(author).to.have.property('createdAt', '2020-03-02T21:17:12.302Z')
          chaiExpect(author).to.have.property('updatedAt', '2020-03-02T21:17:12.302Z')

          const category = res.body.categories[0]
          chaiExpect(category).to.have.property('id', 'SuCRgv5pdf')
          chaiExpect(category).to.have.property('fullPath', 'Comedy')
          chaiExpect(category).to.have.property('slug', 'comedy')
          chaiExpect(category).to.have.property('title', 'Comedy')
          chaiExpect(category).to.have.property('createdAt', '2020-04-03T06:49:43.625Z')
          chaiExpect(category).to.have.property('updatedAt', '2020-04-03T06:49:43.625Z')

          const feedUrl = res.body.feedUrls[0]
          chaiExpect(feedUrl).to.have.property('id', 'abHIMhblL')
          chaiExpect(feedUrl).to.have.property('isAuthority', true)
          chaiExpect(feedUrl).to.have.property('url', 'https://audioboom.com/channels/4954758.rss')
          chaiExpect(feedUrl).to.have.property('createdAt', '2020-03-02T21:15:50.483Z')
          chaiExpect(feedUrl).to.have.property('updatedAt', '2020-04-03T06:51:03.621Z')
          
          

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/mN25xfadfFjDG`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body).to.have.property('message', 'Podcast not found')

          done()
        })
    })
  })

})
