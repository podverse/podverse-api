import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_mediaRef endpoints', () => {

  describe('get by id', () => {
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/mediaRef/9rA5BhWp`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body.id).to.eql('9rA5BhWp')
          chaiExpect(res.body.endTime).to.eql(1680)
          chaiExpect(res.body.isPublic).to.eql(true)
          chaiExpect(res.body.pastHourTotalUniquePageviews).to.eql(7)
          chaiExpect(res.body.pastDayTotalUniquePageviews).to.eql(8)
          chaiExpect(res.body.pastWeekTotalUniquePageviews).to.eql(9)
          chaiExpect(res.body.pastMonthTotalUniquePageviews).to.eql(0)
          chaiExpect(res.body.pastYearTotalUniquePageviews).to.eql(1)
          chaiExpect(res.body.pastAllTimeTotalUniquePageviews).to.eql(2)
          chaiExpect(res.body.startTime).to.eql(1500)
          chaiExpect(res.body.title).to.eql('Amet aliquam id diam maecenas ultricies mi eget.')
          chaiExpect(res.body.createdAt).to.eql('2020-03-02T22:37:36.073Z')
          chaiExpect(res.body.updatedAt).to.eql('2020-03-02T22:58:19.378Z')
          //authors
          //categories
          

          const episode = res.body.episode
          chaiExpect(episode.id).to.eql('fFmGXkgIM')
          chaiExpect(episode).to.have.property('description')
          chaiExpect(episode.duration).to.eql(0)
          chaiExpect(episode.episodeType).to.eql('full')
          chaiExpect(episode.guid).to.eql('465b2bdc-eebd-11e9-85c8-171e42a72b35')
          chaiExpect(episode.imageUrl).to.eql(null)
          chaiExpect(episode.isExplicit).to.eql(false)
          chaiExpect(episode.isPublic).to.eql(true)
          chaiExpect(episode.linkUrl).to.eql(null)
          chaiExpect(episode.mediaFilesize).to.eql(0)
          chaiExpect(episode.mediaType).to.eql('audio/mpeg')
          chaiExpect(episode.mediaUrl).to.eql('https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/chtbl.com/track/524GE/traffic.megaphone.fm/VMP3689667624.mp3')
          chaiExpect(episode.pastHourTotalUniquePageviews).to.eql(1)
          chaiExpect(episode.pastDayTotalUniquePageviews).to.eql(2)
          chaiExpect(episode.pastWeekTotalUniquePageviews).to.eql(3)
          chaiExpect(episode.pastMonthTotalUniquePageviews).to.eql(4)
          chaiExpect(episode.pastYearTotalUniquePageviews).to.eql(5)
          chaiExpect(episode.pastAllTimeTotalUniquePageviews).to.eql(6)
          chaiExpect(episode.pubDate).to.eql('2020-03-02T05:01:00.000Z')
          chaiExpect(episode.title).to.eql('Jason Calacanis: TikTok should be banned, Tim Cook doesn\'t have enough \"chutzpah,\" and Uber will be fine')
          chaiExpect(episode.podcastId).to.eql('zRo1jwx67')
          chaiExpect(episode.createdAt).to.eql('2020-03-02T21:17:39.462Z')
          chaiExpect(episode.updatedAt).to.eql('2020-04-03T06:52:52.361Z')

          
          

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/mediaRef/9rA5BasdfhWp`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.eql('MediaRef not found')

          done()
        })
    })
  })

})
