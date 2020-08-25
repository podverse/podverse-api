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
          chaiExpect(res.body.id).to.equal('mN25xFjDG')
          chaiExpect(res.body.alwaysFullyParse).to.equal(false)
          chaiExpect(res.body.authorityId).to.equal(null)
          chaiExpect(res.body).to.have.property('description')
          chaiExpect(res.body.feedLastParseFailed).to.equal(false)
          chaiExpect(res.body.feedLastUpdated).to.equal('2020-03-30T20:27:19.000Z')
          chaiExpect(res.body.guid).to.equal(null)
          chaiExpect(res.body.hideDynamicAdsWarning).to.equal(false)
          chaiExpect(res.body.imageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/SfjLyq3660/duncantrussellfamilyhour.jpg')
          chaiExpect(res.body.isExplicit).to.equal(true)
          chaiExpect(res.body.isPublic).to.equal(true)
          chaiExpect(res.body.language).to.equal('en-us')
          chaiExpect(res.body.lastEpisodePubDate).to.equal('2020-03-30T20:24:14.000Z')
          chaiExpect(res.body.lastEpisodeTitle).to.equal('378: David Nichtern')
          chaiExpect(res.body.linkUrl).to.equal('http://www.duncantrussell.com/')
          chaiExpect(res.body.pastAllTimeTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastHourTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastDayTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastWeekTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastMonthTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.pastYearTotalUniquePageviews).to.equal(0)
          chaiExpect(res.body.shrunkImageUrl).to.equal(null)
          chaiExpect(res.body.sortableTitle).to.equal('duncan trussell family hour')
          chaiExpect(res.body.title).to.equal('Duncan Trussell Family Hour')
          chaiExpect(res.body.type).to.equal('episodic')
          chaiExpect(res.body.createdAt).to.equal('2020-03-02T21:17:12.363Z')
          chaiExpect(res.body.updatedAt).to.equal('2020-04-03T06:50:58.279Z')


          const author = res.body.authors[0]
          chaiExpect(author.id).to.equal('uS56AylX')
          chaiExpect(author.name).to.equal('Duncan Trussell Family Hour')
          chaiExpect(author.slug).to.equal('duncantrussellfamilyhour')
          chaiExpect(author.createdAt).to.equal('2020-03-02T21:17:12.302Z')
          chaiExpect(author.updatedAt).to.equal('2020-03-02T21:17:12.302Z')

          const category = res.body.categories[0]
          chaiExpect(category.id).to.equal('SuCRgv5pdf')
          chaiExpect(category.fullPath).to.equal('Comedy')
          chaiExpect(category.slug).to.equal('comedy')
          chaiExpect(category.title).to.equal('Comedy')
          chaiExpect(category.createdAt).to.equal('2020-04-03T06:49:43.625Z')
          chaiExpect(category.updatedAt).to.equal('2020-04-03T06:49:43.625Z')

          const feedUrl = res.body.feedUrls[0]
          chaiExpect(feedUrl.id).to.equal('abHIMhblL')
          chaiExpect(feedUrl.isAuthority).to.equal(true)
          chaiExpect(feedUrl.url).to.equal('https://audioboom.com/channels/4954758.rss')
          chaiExpect(feedUrl.createdAt).to.equal('2020-03-02T21:15:50.483Z')
          chaiExpect(feedUrl.updatedAt).to.equal('2020-04-03T06:51:03.621Z')
          
          

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/mN25xfadfFjDG`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.equal('Podcast not found')

          done()
        })
    })
  })

})
