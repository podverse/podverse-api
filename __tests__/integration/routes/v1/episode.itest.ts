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
          chaiExpect(res.body.id).to.eql('gRgjd3YcKb')
          chaiExpect(res.body).to.have.property('description')
          chaiExpect(res.body.isPublic).to.eql(true)
          chaiExpect(res.body.duration).to.eql(0)
          chaiExpect(res.body.episodeType).to.eql('full')
          chaiExpect(res.body.guid).to.eql('prx_96_99a841bb-27cf-44de-908a-2d33f1265c83')
          chaiExpect(res.body.imageUrl).to.eql('https://f.prxu.org/96/99a841bb-27cf-44de-908a-2d33f1265c83/images/1c3def2b-b305-4903-8df2-bfe1821aaf7c/99pi_iTunes_Badge_Zag_1400.jpg')
          chaiExpect(res.body.isExplicit).to.eql(false)
          chaiExpect(res.body.isPublic).to.eql(true)
          chaiExpect(res.body.linkUrl).to.eql(null)
          chaiExpect(res.body.mediaFilesize).to.eql(0)
          chaiExpect(res.body.mediaType).to.eql('audio/mpeg')
          chaiExpect(res.body.mediaUrl).to.eql('https://dts.podtrac.com/redirect.mp3/media.blubrry.com/99percentinvisible/dovetail.prxu.org/96/99a841bb-27cf-44de-908a-2d33f1265c83/335_Gathering_the_Magic_pt01.mp3')
          chaiExpect(res.body.pastHourTotalUniquePageviews).to.eql(1)
          chaiExpect(res.body.pastDayTotalUniquePageviews).to.eql(2)
          chaiExpect(res.body.pastWeekTotalUniquePageviews).to.eql(3)
          chaiExpect(res.body.pastMonthTotalUniquePageviews).to.eql(4)
          chaiExpect(res.body.pastYearTotalUniquePageviews).to.eql(5)
          chaiExpect(res.body.pastAllTimeTotalUniquePageviews).to.eql(6)
          chaiExpect(res.body.pubDate).to.eql('2019-01-01T23:54:08.000Z')
          chaiExpect(res.body.title).to.eql('335- Gathering the Magic')
          chaiExpect(res.body.podcastId).to.eql('0RMk6UYGq')
          chaiExpect(res.body.createdAt).to.eql('2020-03-02T21:17:46.840Z')
          chaiExpect(res.body.updatedAt).to.eql('2020-04-03T06:53:12.123Z')
          chaiExpect(res.body.authors).to.eql([])
          chaiExpect(res.body.categories).to.eql([])

          const mediaRef = res.body.mediaRefs[0]
          chaiExpect(mediaRef.id).to.eql('o0WTxqON')
          chaiExpect(mediaRef.endTime).to.eql(660)
          chaiExpect(mediaRef.isPublic).to.eql(true)
          chaiExpect(mediaRef.pastHourTotalUniquePageviews).to.eql(0)
          chaiExpect(mediaRef.pastDayTotalUniquePageviews).to.eql(0)
          chaiExpect(mediaRef.pastWeekTotalUniquePageviews).to.eql(0)
          chaiExpect(mediaRef.pastMonthTotalUniquePageviews).to.eql(0)
          chaiExpect(mediaRef.pastYearTotalUniquePageviews).to.eql(0)
          chaiExpect(mediaRef.pastAllTimeTotalUniquePageviews).to.eql(0)
          chaiExpect(mediaRef.startTime).to.eql(480)
          chaiExpect(mediaRef.title).to.eql('Consectetur lorem donec massa sapien faucibus et molestie ac. Purus semper eget duis at tellus.')
          chaiExpect(mediaRef.createdAt).to.eql('2020-03-02T22:13:33.820Z')
          chaiExpect(mediaRef.updatedAt).to.eql('2020-03-02T22:13:33.820Z')
          
          

          done()
        })
    })
    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/episode/gRgjd3asdfYcKb`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.eql('Episode not found')

          done()
        })
    })
  })

})
