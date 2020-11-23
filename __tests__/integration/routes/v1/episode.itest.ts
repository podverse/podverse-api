import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_episode endpoints', () => {

  describe('get by id', () => {
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/episode/gRgjd3YcKb`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body.id).to.equal('gRgjd3YcKb')
          chaiExpect(res.body.chaptersType).to.equal(null)
          chaiExpect(res.body.chaptersUrl).to.equal(null)
          chaiExpect(res.body.chaptersUrlLastParsed).to.equal(null)
          chaiExpect(res.body).to.have.property('description')
          chaiExpect(res.body.duration).to.equal(0)
          chaiExpect(res.body.episodeType).to.equal('full')
          chaiExpect(res.body.funding).to.equal(null)
          chaiExpect(res.body.guid).to.equal('prx_96_99a841bb-27cf-44de-908a-2d33f1265c83')
          chaiExpect(res.body.imageUrl).to.equal('https://f.prxu.org/96/99a841bb-27cf-44de-908a-2d33f1265c83/images/1c3def2b-b305-4903-8df2-bfe1821aaf7c/99pi_iTunes_Badge_Zag_1400.jpg')
          chaiExpect(res.body.isExplicit).to.equal(false)
          chaiExpect(res.body.isPublic).to.equal(true)
          chaiExpect(res.body.linkUrl).to.equal(null)
          chaiExpect(res.body.mediaFilesize).to.equal(0)
          chaiExpect(res.body.mediaType).to.equal('audio/mpeg')
          chaiExpect(res.body.mediaUrl).to.equal('https://dts.podtrac.com/redirect.mp3/media.blubrry.com/99percentinvisible/dovetail.prxu.org/96/99a841bb-27cf-44de-908a-2d33f1265c83/335_Gathering_the_Magic_pt01.mp3')
          chaiExpect(res.body.pastHourTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastDayTotalUniquePageviews).to.equal(2)
          chaiExpect(res.body.pastWeekTotalUniquePageviews).to.equal(3)
          chaiExpect(res.body.pastMonthTotalUniquePageviews).to.equal(4)
          chaiExpect(res.body.pastYearTotalUniquePageviews).to.equal(5)
          chaiExpect(res.body.pastAllTimeTotalUniquePageviews).to.equal(6)
          chaiExpect(res.body).to.have.property('pubDate')
          chaiExpect(res.body.title).to.equal('335- Gathering the Magic')
          chaiExpect(res.body.transcript).to.equal(null)
          chaiExpect(res.body.podcastId).to.equal('0RMk6UYGq')
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')
          chaiExpect(res.body.authors).to.eql([])
          chaiExpect(res.body.categories).to.eql([])

          const podcast = res.body.podcast
          chaiExpect(podcast.id).to.equal('0RMk6UYGq')
          chaiExpect(podcast.podcastIndexId).to.equal(null)
          chaiExpect(podcast.authorityId).to.equal(null)
          chaiExpect(podcast.alwaysFullyParse).to.equal(false)
          chaiExpect(podcast).to.have.property('description')
          chaiExpect(podcast.feedLastParseFailed).to.equal(false)
          chaiExpect(podcast).to.have.property('feedLastUpdated')
          chaiExpect(podcast.funding).to.equal(null)
          chaiExpect(podcast.guid).to.equal(null)
          chaiExpect(podcast.hideDynamicAdsWarning).to.equal(false)
          chaiExpect(podcast.imageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/Fl1_e2DuIH/99invisible.png')
          chaiExpect(podcast.isExplicit).to.equal(false)
          chaiExpect(podcast.isPublic).to.equal(true)
          chaiExpect(podcast.language).to.equal('en-us')
          chaiExpect(podcast).to.have.property('lastEpisodePubDate')
          chaiExpect(podcast.lastEpisodeTitle).to.equal('396- This Day in Esoteric Political History')
          chaiExpect(podcast.linkUrl).to.equal('http://99percentinvisible.org')
          chaiExpect(podcast.pastAllTimeTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.pastHourTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.pastDayTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.pastWeekTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.pastMonthTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.pastYearTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.shrunkImageUrl).to.equal(null)
          chaiExpect(podcast.sortableTitle).to.equal('99% invisible')
          chaiExpect(podcast.title).to.equal('99% Invisible')
          chaiExpect(podcast.type).to.equal('episodic')
          chaiExpect(podcast.value).to.equal(null)
          chaiExpect(podcast).to.have.property('createdAt')
          chaiExpect(podcast).to.have.property('updatedAt')

          const feedUrls = res.body.podcast.feedUrls[0]
          chaiExpect(feedUrls.id).to.equal('yJlpeBbN0-')
          chaiExpect(feedUrls.isAuthority).to.equal(true)
          chaiExpect(feedUrls.url).to.equal('http://feeds.99percentinvisible.org/99percentinvisible')
          chaiExpect(feedUrls).to.have.property('createdAt')
          chaiExpect(feedUrls).to.have.property('updatedAt')

          const authors = res.body.podcast.authors[0]
          chaiExpect(authors.id).to.equal('rHB1EJna')
          chaiExpect(authors.name).to.equal('Roman Mars')
          chaiExpect(authors.slug).to.equal('romanmars')
          chaiExpect(authors).to.have.property('createdAt')
          chaiExpect(authors).to.have.property('updatedAt')

          const categories = res.body.podcast.categories
          chaiExpect(categories[0].id).to.equal('jeW7cF_Pv')
          chaiExpect(categories[0].fullPath).to.equal('Arts')
          chaiExpect(categories[0].slug).to.equal('arts')
          chaiExpect(categories[0].title).to.equal('Arts')
          chaiExpect(categories[0]).to.have.property('createdAt')
          chaiExpect(categories[0]).to.have.property('updatedAt')

          chaiExpect(categories[1].id).to.equal('2ELHNnfE9Y')
          chaiExpect(categories[1].fullPath).to.equal('Arts>Design')
          chaiExpect(categories[1].slug).to.equal('design')
          chaiExpect(categories[1].title).to.equal('Design')
          chaiExpect(categories[1]).to.have.property('createdAt')
          chaiExpect(categories[1]).to.have.property('updatedAt')

          chaiExpect(Object.keys(res.body).length).to.equal(31)
          
          done()
        })
    })
    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/episode/gRgjd3asdfYcKb`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.equal('Episode not found')

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('find by query', () => {
    test('top past week', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/episode?sort=top-past-week`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          const episodes = res.body[0]
          const episode = episodes[0]
          
          chaiExpect(episode.id).to.equal('tfAg_PJjx9')
          chaiExpect(episode.duration).to.equal(0)
          chaiExpect(episode.episodeType).to.equal('full')
          chaiExpect(episode.guid).to.equal('72718914-ff3f-11e8-a2df-3b7ce7823cac')
          chaiExpect(episode.imageUrl).to.equal(null)
          chaiExpect(episode.isExplicit).to.equal(false)
          chaiExpect(episode.isPublic).to.equal(true)
          chaiExpect(episode.linkUrl).to.equal(null)
          chaiExpect(episode.mediaFilesize).to.equal(0)
          chaiExpect(episode.mediaType).to.equal('audio/mpeg')
          chaiExpect(episode.mediaUrl).to.equal('https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/chtbl.com/track/524GE/traffic.megaphone.fm/VMP8741400441.mp3')
          chaiExpect(episode.pastHourTotalUniquePageviews).to.equal(1)
          chaiExpect(episode.pastDayTotalUniquePageviews).to.equal(2)
          chaiExpect(episode.pastWeekTotalUniquePageviews).to.equal(7)
          chaiExpect(episode.pastMonthTotalUniquePageviews).to.equal(4)
          chaiExpect(episode.pastYearTotalUniquePageviews).to.equal(5)
          chaiExpect(episode.pastAllTimeTotalUniquePageviews).to.equal(6)
          chaiExpect(episode).to.have.property('pubDate')
          chaiExpect(episode.title).to.equal('\"Antisocial\" author Andrew Marantz on how the far right hijacked the internet')
          chaiExpect(episode).to.have.property('description')

          const episode0 = episodes[1]
          const episode1 = episodes[2]
          const episode2 = episodes[3]

          chaiExpect(episode0.id).to.equal('TKqJs3hoF7')

          chaiExpect(episode1.id).to.equal('W7-RAalET')

          chaiExpect(episode2.id).to.equal('CBfXbA5c0Y8')

          chaiExpect(Object.keys(res.body).length).to.equal(2)

          done()
        })
    })
  })

})
