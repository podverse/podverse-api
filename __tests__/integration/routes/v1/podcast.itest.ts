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
          chaiExpect(res.body.id).to.eql('mN25xFjDG')
          chaiExpect(res.body.alwaysFullyParse).to.eql(false)
          chaiExpect(res.body.authorityId).to.eql(null)
          chaiExpect(res.body).to.have.property('description')
          chaiExpect(res.body.feedLastParseFailed).to.eql(false)
          chaiExpect(res.body.feedLastUpdated).to.eql('2020-03-30T20:27:19.000Z')
          chaiExpect(res.body.guid).to.eql(null)
          chaiExpect(res.body.hideDynamicAdsWarning).to.eql(false)
          chaiExpect(res.body.imageUrl).to.eql('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/SfjLyq3660/duncantrussellfamilyhour.jpg')
          chaiExpect(res.body.isExplicit).to.eql(true)
          chaiExpect(res.body.isPublic).to.eql(true)
          chaiExpect(res.body.language).to.eql('en-us')
          chaiExpect(res.body.lastEpisodePubDate).to.eql('2020-03-30T20:24:14.000Z')
          chaiExpect(res.body.lastEpisodeTitle).to.eql('378: David Nichtern')
          chaiExpect(res.body.linkUrl).to.eql('http://www.duncantrussell.com/')
          chaiExpect(res.body.pastAllTimeTotalUniquePageviews).to.eql(0)
          chaiExpect(res.body.pastHourTotalUniquePageviews).to.eql(0)
          chaiExpect(res.body.pastDayTotalUniquePageviews).to.eql(0)
          chaiExpect(res.body.pastWeekTotalUniquePageviews).to.eql(0)
          chaiExpect(res.body.pastMonthTotalUniquePageviews).to.eql(0)
          chaiExpect(res.body.pastYearTotalUniquePageviews).to.eql(0)
          chaiExpect(res.body.shrunkImageUrl).to.eql(null)
          chaiExpect(res.body.sortableTitle).to.eql('duncan trussell family hour')
          chaiExpect(res.body.title).to.eql('Duncan Trussell Family Hour')
          chaiExpect(res.body.type).to.eql('episodic')
          chaiExpect(res.body.createdAt).to.eql('2020-03-02T21:17:12.363Z')
          chaiExpect(res.body.updatedAt).to.eql('2020-04-03T06:50:58.279Z')


          const author = res.body.authors[0]
          chaiExpect(author.id).to.eql('uS56AylX')
          chaiExpect(author.name).to.eql('Duncan Trussell Family Hour')
          chaiExpect(author.slug).to.eql('duncantrussellfamilyhour')
          chaiExpect(author.createdAt).to.eql('2020-03-02T21:17:12.302Z')
          chaiExpect(author.updatedAt).to.eql('2020-03-02T21:17:12.302Z')

          const category = res.body.categories[0]
          chaiExpect(category.id).to.eql('SuCRgv5pdf')
          chaiExpect(category.fullPath).to.eql('Comedy')
          chaiExpect(category.slug).to.eql('comedy')
          chaiExpect(category.title).to.eql('Comedy')
          chaiExpect(category.createdAt).to.eql('2020-04-03T06:49:43.625Z')
          chaiExpect(category.updatedAt).to.eql('2020-04-03T06:49:43.625Z')

          const feedUrl = res.body.feedUrls[0]
          chaiExpect(feedUrl.id).to.eql('abHIMhblL')
          chaiExpect(feedUrl.isAuthority).to.eql(true)
          chaiExpect(feedUrl.url).to.eql('https://audioboom.com/channels/4954758.rss')
          chaiExpect(feedUrl.createdAt).to.eql('2020-03-02T21:15:50.483Z')
          chaiExpect(feedUrl.updatedAt).to.eql('2020-04-03T06:51:03.621Z')
          
          

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/mN25xfadfFjDG`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.eql('Podcast not found')

          done()
        })
    })
  })

})
