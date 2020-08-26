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
          chaiExpect(res.body).to.have.property('description')
          chaiExpect(res.body.isPublic).to.equal(true)
          chaiExpect(res.body.duration).to.equal(0)
          chaiExpect(res.body.episodeType).to.equal('full')
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
          chaiExpect(res.body.pubDate).to.equal('2019-01-01T23:54:08.000Z')
          chaiExpect(res.body.title).to.equal('335- Gathering the Magic')
          chaiExpect(res.body.podcastId).to.equal('0RMk6UYGq')
          chaiExpect(res.body.createdAt).to.equal('2020-03-02T21:17:46.840Z')
          chaiExpect(res.body.updatedAt).to.equal('2020-04-03T06:53:12.123Z')
          chaiExpect(res.body.authors).to.eql([])
          chaiExpect(res.body.categories).to.eql([])

          const mediaRef = res.body.mediaRefs[0]
          chaiExpect(mediaRef.id).to.equal('o0WTxqON')
          chaiExpect(mediaRef.endTime).to.equal(660)
          chaiExpect(mediaRef.isPublic).to.equal(true)
          chaiExpect(mediaRef.pastHourTotalUniquePageviews).to.equal(0)
          chaiExpect(mediaRef.pastDayTotalUniquePageviews).to.equal(0)
          chaiExpect(mediaRef.pastWeekTotalUniquePageviews).to.equal(0)
          chaiExpect(mediaRef.pastMonthTotalUniquePageviews).to.equal(0)
          chaiExpect(mediaRef.pastYearTotalUniquePageviews).to.equal(0)
          chaiExpect(mediaRef.pastAllTimeTotalUniquePageviews).to.equal(0)
          chaiExpect(mediaRef.startTime).to.equal(480)
          chaiExpect(mediaRef.title).to.equal('Consectetur lorem donec massa sapien faucibus et molestie ac. Purus semper eget duis at tellus.')
          chaiExpect(mediaRef.createdAt).to.equal('2020-03-02T22:13:33.820Z')
          chaiExpect(mediaRef.updatedAt).to.equal('2020-03-02T22:13:33.820Z')
          
          

          done()
        })
    })
    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/episode/gRgjd3asdfYcKb`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.equal('Episode not found')

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
          
          chaiExpect(res.body[0][0].id).to.equal('tfAg_PJjx9')
          chaiExpect(res.body[0][0].duration).to.equal(0)
          chaiExpect(res.body[0][0].episodeType).to.equal('full')
          chaiExpect(res.body[0][0].guid).to.equal('72718914-ff3f-11e8-a2df-3b7ce7823cac')
          chaiExpect(res.body[0][0].imageUrl).to.equal(null)
          chaiExpect(res.body[0][0].isExplicit).to.equal(false)
          chaiExpect(res.body[0][0].isPublic).to.equal(true)
          chaiExpect(res.body[0][0].linkUrl).to.equal(null)
          chaiExpect(res.body[0][0].mediaFilesize).to.equal(0)
          chaiExpect(res.body[0][0].mediaType).to.equal('audio/mpeg')
          chaiExpect(res.body[0][0].mediaUrl).to.equal('https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/chtbl.com/track/524GE/traffic.megaphone.fm/VMP8741400441.mp3')
          chaiExpect(res.body[0][0].pastHourTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body[0][0].pastDayTotalUniquePageviews).to.equal(2)
          chaiExpect(res.body[0][0].pastWeekTotalUniquePageviews).to.equal(7)
          chaiExpect(res.body[0][0].pastMonthTotalUniquePageviews).to.equal(4)
          chaiExpect(res.body[0][0].pastYearTotalUniquePageviews).to.equal(5)
          chaiExpect(res.body[0][0].pastAllTimeTotalUniquePageviews).to.equal(6)
          chaiExpect(res.body[0][0].pubDate).to.equal('2019-10-09T04:01:00.000Z')
          chaiExpect(res.body[0][0].title).to.equal('\"Antisocial\" author Andrew Marantz on how the far right hijacked the internet')
          chaiExpect(res.body[0][0]).to.have.property('description')

          chaiExpect(res.body[0][1].id).to.equal('TKqJs3hoF7')

          chaiExpect(res.body[0][2].id).to.equal('W7-RAalET')

          chaiExpect(res.body[0][3].id).to.equal('CBfXbA5c0Y8')

          done()
        })
    })
  })

})
