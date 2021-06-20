import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { testUsers, v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('Podcast endpoints', () => {

  describe('get by id', () => {
    
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/mN25xFjDG`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body.id).to.equal('mN25xFjDG')
          chaiExpect(res.body.int_id).to.equal(16)
          chaiExpect(res.body.podcastIndexId).to.equal('199138')
          chaiExpect(res.body.authorityId).to.equal(null)
          chaiExpect(res.body.alwaysFullyParse).to.equal(false)
          chaiExpect(res.body).to.have.property('description')
          chaiExpect(res.body.feedLastParseFailed).to.equal(false)
          chaiExpect(res.body).to.have.property('feedLastUpdated')
          chaiExpect(res.body.funding).to.equal(null)
          chaiExpect(res.body.guid).to.equal(null)
          chaiExpect(res.body.hideDynamicAdsWarning).to.equal(false)
          chaiExpect(res.body.imageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/SfjLyq3660/duncantrussellfamilyhour.jpg')
          chaiExpect(res.body.isExplicit).to.equal(true)
          chaiExpect(res.body.isPublic).to.equal(true)
          chaiExpect(res.body.language).to.equal('en-us')
          chaiExpect(res.body).to.have.property('lastEpisodePubDate')
          chaiExpect(res.body.lastEpisodeTitle).to.equal('378: David Nichtern')
          chaiExpect(res.body.linkUrl).to.equal('http://www.duncantrussell.com/')
          chaiExpect(res.body.pastAllTimeTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastHourTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastDayTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastWeekTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastMonthTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastYearTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.shrunkImageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/SfjLyq3660/duncantrussellfamilyhour.jpg')
          chaiExpect(res.body.sortableTitle).to.equal('duncan trussell family hour')
          chaiExpect(res.body.title).to.equal('Duncan Trussell Family Hour')
          chaiExpect(res.body.type).to.equal('episodic')
          chaiExpect(res.body.value).to.equal(null)
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')


          const author = res.body.authors[0]
          chaiExpect(author.id).to.equal('uS56AylX')
          chaiExpect(author.name).to.equal('Duncan Trussell Family Hour')
          chaiExpect(author.slug).to.equal('duncantrussellfamilyhour')
          chaiExpect(author).to.have.property('createdAt')
          chaiExpect(author).to.have.property('updatedAt')

          const category0 = res.body.categories[0]
          chaiExpect(category0.id).to.equal('SuCRgv5pdf')
          chaiExpect(category0.fullPath).to.equal('Comedy')
          chaiExpect(category0.slug).to.equal('comedy')
          chaiExpect(category0.title).to.equal('Comedy')
          chaiExpect(category0).to.have.property('createdAt')
          chaiExpect(category0).to.have.property('updatedAt')

          const category1 = res.body.categories[1]
          chaiExpect(category1.id).to.equal('OBvOcKSZl3')
          chaiExpect(category1.fullPath).to.equal('Religion & Spirituality')
          chaiExpect(category1.slug).to.equal('religionspirituality')
          chaiExpect(category1.title).to.equal('Religion & Spirituality')
          chaiExpect(category1).to.have.property('createdAt')
          chaiExpect(category1).to.have.property('updatedAt')

          const category2 = res.body.categories[2]
          chaiExpect(category2.id).to.equal('jTvNqx0NeK')
          chaiExpect(category2.fullPath).to.equal('Society & Culture')
          chaiExpect(category2.slug).to.equal('societyculture')
          chaiExpect(category2.title).to.equal('Society & Culture')
          chaiExpect(category2).to.have.property('createdAt')
          chaiExpect(category2).to.have.property('updatedAt')

          const category3 = res.body.categories[3]
          chaiExpect(category3.id).to.equal('VsNtKy7T-0x')
          chaiExpect(category3.fullPath).to.equal('Society & Culture>Philosophy')
          chaiExpect(category3.slug).to.equal('philosophy')
          chaiExpect(category3.title).to.equal('Philosophy')
          chaiExpect(category3).to.have.property('createdAt')
          chaiExpect(category3).to.have.property('updatedAt')

          const feedUrl = res.body.feedUrls[0]
          chaiExpect(feedUrl.id).to.equal('abHIMhblL')
          chaiExpect(feedUrl.isAuthority).to.equal(true)
          chaiExpect(feedUrl.url).to.equal('https://audioboom.com/channels/4954758.rss')
          chaiExpect(feedUrl).to.have.property('createdAt')
          chaiExpect(feedUrl).to.have.property('updatedAt')      
          
          chaiExpect(Object.keys(res.body).length).to.equal(36)

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/mN25xfadfFjDG`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.equal('Podcast not found')

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('get by Podcast Index id', () => {
    
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/podcastindex/data/199138`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body.id).to.equal('mN25xFjDG')
          chaiExpect(res.body.int_id).to.equal(16)
          chaiExpect(res.body.podcastIndexId).to.equal('199138')
          chaiExpect(res.body.authorityId).to.equal(null)
          chaiExpect(res.body.alwaysFullyParse).to.equal(false)
          chaiExpect(res.body).to.have.property('description')
          chaiExpect(res.body.feedLastParseFailed).to.equal(false)
          chaiExpect(res.body).to.have.property('feedLastUpdated')
          chaiExpect(res.body.funding).to.equal(null)
          chaiExpect(res.body.guid).to.equal(null)
          chaiExpect(res.body.hideDynamicAdsWarning).to.equal(false)
          chaiExpect(res.body.imageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/SfjLyq3660/duncantrussellfamilyhour.jpg')
          chaiExpect(res.body.isExplicit).to.equal(true)
          chaiExpect(res.body.isPublic).to.equal(true)
          chaiExpect(res.body.language).to.equal('en-us')
          chaiExpect(res.body).to.have.property('lastEpisodePubDate')
          chaiExpect(res.body.lastEpisodeTitle).to.equal('378: David Nichtern')
          chaiExpect(res.body.linkUrl).to.equal('http://www.duncantrussell.com/')
          chaiExpect(res.body.pastAllTimeTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastHourTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastDayTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastWeekTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastMonthTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastYearTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.shrunkImageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/SfjLyq3660/duncantrussellfamilyhour.jpg')
          chaiExpect(res.body.sortableTitle).to.equal('duncan trussell family hour')
          chaiExpect(res.body.title).to.equal('Duncan Trussell Family Hour')
          chaiExpect(res.body.type).to.equal('episodic')
          chaiExpect(res.body.value).to.equal(null)
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')


          const author = res.body.authors[0]
          chaiExpect(author.id).to.equal('uS56AylX')
          chaiExpect(author.name).to.equal('Duncan Trussell Family Hour')
          chaiExpect(author.slug).to.equal('duncantrussellfamilyhour')
          chaiExpect(author).to.have.property('createdAt')
          chaiExpect(author).to.have.property('updatedAt')

          const category0 = res.body.categories[0]
          chaiExpect(category0.id).to.equal('SuCRgv5pdf')
          chaiExpect(category0.fullPath).to.equal('Comedy')
          chaiExpect(category0.slug).to.equal('comedy')
          chaiExpect(category0.title).to.equal('Comedy')
          chaiExpect(category0).to.have.property('createdAt')
          chaiExpect(category0).to.have.property('updatedAt')

          const category1 = res.body.categories[1]
          chaiExpect(category1.id).to.equal('OBvOcKSZl3')
          chaiExpect(category1.fullPath).to.equal('Religion & Spirituality')
          chaiExpect(category1.slug).to.equal('religionspirituality')
          chaiExpect(category1.title).to.equal('Religion & Spirituality')
          chaiExpect(category1).to.have.property('createdAt')
          chaiExpect(category1).to.have.property('updatedAt')

          const category2 = res.body.categories[2]
          chaiExpect(category2.id).to.equal('jTvNqx0NeK')
          chaiExpect(category2.fullPath).to.equal('Society & Culture')
          chaiExpect(category2.slug).to.equal('societyculture')
          chaiExpect(category2.title).to.equal('Society & Culture')
          chaiExpect(category2).to.have.property('createdAt')
          chaiExpect(category2).to.have.property('updatedAt')

          const category3 = res.body.categories[3]
          chaiExpect(category3.id).to.equal('VsNtKy7T-0x')
          chaiExpect(category3.fullPath).to.equal('Society & Culture>Philosophy')
          chaiExpect(category3.slug).to.equal('philosophy')
          chaiExpect(category3.title).to.equal('Philosophy')
          chaiExpect(category3).to.have.property('createdAt')
          chaiExpect(category3).to.have.property('updatedAt')

          const feedUrl = res.body.feedUrls[0]
          chaiExpect(feedUrl.id).to.equal('abHIMhblL')
          chaiExpect(feedUrl.isAuthority).to.equal(true)
          chaiExpect(feedUrl.url).to.equal('https://audioboom.com/channels/4954758.rss')
          chaiExpect(feedUrl).to.have.property('createdAt')
          chaiExpect(feedUrl).to.have.property('updatedAt')      
          
          chaiExpect(Object.keys(res.body).length).to.equal(36)

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/mN25xfadfFjDG`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.equal('Podcast not found')

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('find by query', () => {
    test('top past week', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast?sort=top-past-week`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          const podcasts = res.body[0]
          const podcast = podcasts[0]
          
          chaiExpect(podcast.id).to.equal('Yqft_RG8j')
          chaiExpect(podcast.podcastIndexId).to.equal('200269')
          chaiExpect(podcast).to.have.property('feedLastUpdated')
          chaiExpect(podcast.funding).to.equal(null)
          chaiExpect(podcast.hideDynamicAdsWarning).to.equal(false)
          chaiExpect(podcast.imageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/VncRLwaI7A/verybadwizards.jpg')
          chaiExpect(podcast.isExplicit).to.equal(true)
          chaiExpect(podcast).to.have.property('lastEpisodePubDate')
          chaiExpect(podcast.lastEpisodeTitle).to.equal(`Episode 185: The Devil's Playground`)
          chaiExpect(podcast.lastFoundInPodcastIndex).to.equal(null)
          chaiExpect(podcast.linkUrl).to.equal('https://verybadwizards.fireside.fm')
          chaiExpect(podcast.pastAllTimeTotalUniquePageviews).to.equal(123456789)
          chaiExpect(podcast.pastHourTotalUniquePageviews).to.equal(123456789)
          chaiExpect(podcast.pastDayTotalUniquePageviews).to.equal(123456789)
          chaiExpect(podcast.pastWeekTotalUniquePageviews).to.equal(123456789)
          chaiExpect(podcast.pastMonthTotalUniquePageviews).to.equal(123456789)
          chaiExpect(podcast.pastYearTotalUniquePageviews).to.equal(123456789)
          chaiExpect(podcast.shrunkImageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/VncRLwaI7A/verybadwizards.jpg')
          chaiExpect(podcast.sortableTitle).to.equal(`very bad wizards`)
          chaiExpect(podcast.title).to.equal(`Very Bad Wizards`)
          chaiExpect(podcast.value).to.equal(null)
          chaiExpect(podcast).to.have.property('createdAt')
          chaiExpect(podcast.feedUrls[0].url).to.equal('https://verybadwizards.fireside.fm/rss')


          const podcast1 = podcasts[1]
          chaiExpect(podcast1.id).to.equal('yKyjZDxsB')

          const podcast2 = podcasts[2]
          chaiExpect(podcast2.id).to.equal('xSTqnMUb57K')

          const podcast3 = podcasts[3]
          chaiExpect(podcast3.id).to.equal('kS9ZnQNWlQc')

          const podcast4 = podcasts[4]
          chaiExpect(podcast4.id).to.equal('zRo1jwx67')

          


          chaiExpect(Object.keys(res.body).length).to.equal(2)

          done()
        })
    })
  })

  describe('toggle subscribe', () => {

    test('when the user is not logged in', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/toggle-subscribe/XdbkHTiH9`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)

          chaiExpect(Object.keys(res.body).length).to.equal(0)

          done()
        })
    })
    
    test('when the user is logged in: unsubscribe from user', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/toggle-subscribe/XdbkHTiH9`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          chaiExpect(res.body).to.eql([
            "0RMk6UYGq",
            "kS9ZnQNWlQc",
            "mN25xFjDG",
            "yKyjZDxsB",
            "zRo1jwx67",
            "Yqft_RG8j",
            "GZsvTjDH0",
            "Q_QCTJbNR"
          ])

          chaiExpect(Object.keys(res.body).length).to.equal(8)

          done()
        })
    })

    test('when the user is logged in: subscribe to podcast', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/toggle-subscribe/XdbkHTiH9`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          chaiExpect(res.body).to.eql([
            "0RMk6UYGq",
            "kS9ZnQNWlQc",
            "mN25xFjDG",
            "yKyjZDxsB",
            "zRo1jwx67",
            "Yqft_RG8j",
            "GZsvTjDH0",
            "Q_QCTJbNR",
            "XdbkHTiH9"
          ])

          chaiExpect(Object.keys(res.body).length).to.equal(9)

          done()
        })
    })
  })

  describe('Metadata', () => {
    
    test('get metadata', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/metadata/?podcastId=mN25xFjDG,gyEGNwJud`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          const podcast0 = res.body[0][0]
          const podcast1 = res.body[0][1]

          chaiExpect(podcast0.id).to.equal('gyEGNwJud')
          chaiExpect(podcast0).to.have.property('feedLastUpdated')
          chaiExpect(podcast0.funding).to.equal(null)
          chaiExpect(podcast0.hideDynamicAdsWarning).to.equal(false)
          chaiExpect(podcast0).to.have.property('lastEpisodePubDate')
          chaiExpect(podcast0.lastEpisodeTitle).to.equal('Rob Gronkowski, This Is March, James Harden Pooped Himself, And Lebron Is Still Insane')
          chaiExpect(podcast0.sortableTitle).to.equal('pardon my take')
          chaiExpect(podcast0.title).to.equal('Pardon My Take')
          chaiExpect(podcast0.value).to.equal(null)

          chaiExpect(podcast1.id).to.equal('mN25xFjDG')
          chaiExpect(podcast1).to.have.property('feedLastUpdated')
          chaiExpect(podcast1.funding).to.equal(null)
          chaiExpect(podcast1.hideDynamicAdsWarning).to.equal(false)
          chaiExpect(podcast1).to.have.property('lastEpisodePubDate')
          chaiExpect(podcast1.lastEpisodeTitle).to.equal('378: David Nichtern')
          chaiExpect(podcast1.sortableTitle).to.equal('duncan trussell family hour')
          chaiExpect(podcast1.title).to.equal('Duncan Trussell Family Hour')
          chaiExpect(podcast1.value).to.equal(null)

          chaiExpect(Object.keys(res.body).length).to.equal(2)

          done()
        })
    })
  }) 

//TODO> Change "playlist" to "podcast"

  describe('find by query subscribed', () => {

    test('Top past week - Invalid user', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/playlist/subscribed?sort=top-past-week`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)

          chaiExpect(Object.keys(res.body).length).to.equal(0)

          done()
        })
    })

    test('Top past week - Premium Valid', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/playlist/subscribed?sort=top-past-week`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          const podcast0 = res.body[0]

          chaiExpect(podcast0.id).to.equal('wgOok7Xp')
          
          chaiExpect(Object.keys(res.body).length).to.equal(2)


          done()
        })
    })
    
  })

})
