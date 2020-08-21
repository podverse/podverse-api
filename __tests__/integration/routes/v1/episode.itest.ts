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
          chaiExpect(res.body).to.have.property('id', 'gRgjd3YcKb')
          chaiExpect(res.body).to.have.property('description')
          chaiExpect(res.body).to.have.property('isPublic', true)
          chaiExpect(res.body).to.have.property('duration', 0)
          chaiExpect(res.body).to.have.property('episodeType', 'full')
          chaiExpect(res.body).to.have.property('guid', 'prx_96_99a841bb-27cf-44de-908a-2d33f1265c83')
          chaiExpect(res.body).to.have.property('imageUrl', 'https://f.prxu.org/96/99a841bb-27cf-44de-908a-2d33f1265c83/images/1c3def2b-b305-4903-8df2-bfe1821aaf7c/99pi_iTunes_Badge_Zag_1400.jpg')
          chaiExpect(res.body).to.have.property('isExplicit', false)
          chaiExpect(res.body).to.have.property('isPublic', true)
          chaiExpect(res.body).to.have.property('linkUrl', null)
          chaiExpect(res.body).to.have.property('mediaFilesize', 0)
          chaiExpect(res.body).to.have.property('mediaType', 'audio/mpeg')
          chaiExpect(res.body).to.have.property('mediaUrl', 'https://dts.podtrac.com/redirect.mp3/media.blubrry.com/99percentinvisible/dovetail.prxu.org/96/99a841bb-27cf-44de-908a-2d33f1265c83/335_Gathering_the_Magic_pt01.mp3')
          chaiExpect(res.body).to.have.property('pastHourTotalUniquePageviews', 1)
          chaiExpect(res.body).to.have.property('pastDayTotalUniquePageviews', 2)
          chaiExpect(res.body).to.have.property('pastWeekTotalUniquePageviews', 3)
          chaiExpect(res.body).to.have.property('pastMonthTotalUniquePageviews', 4)
          chaiExpect(res.body).to.have.property('pastYearTotalUniquePageviews', 5)
          chaiExpect(res.body).to.have.property('pastAllTimeTotalUniquePageviews', 6)
          chaiExpect(res.body).to.have.property('pubDate', '2019-01-01T23:54:08.000Z')
          chaiExpect(res.body).to.have.property('title', '335- Gathering the Magic')
          chaiExpect(res.body).to.have.property('podcastId', '0RMk6UYGq')
          chaiExpect(res.body).to.have.property('createdAt', '2020-03-02T21:17:46.840Z')
          chaiExpect(res.body).to.have.property('updatedAt', '2020-04-03T06:53:12.123Z')
          //authors
          //categories

          const mediaRef = res.body.mediaRefs[0]
          chaiExpect(mediaRef).to.have.property('id', 'o0WTxqON')
          chaiExpect(mediaRef).to.have.property('endTime', 660)
          chaiExpect(mediaRef).to.have.property('isPublic', true)
          chaiExpect(mediaRef).to.have.property('pastHourTotalUniquePageviews', 0)
          chaiExpect(mediaRef).to.have.property('pastDayTotalUniquePageviews', 0)
          chaiExpect(mediaRef).to.have.property('pastWeekTotalUniquePageviews', 0)
          chaiExpect(mediaRef).to.have.property('pastMonthTotalUniquePageviews', 0)
          chaiExpect(mediaRef).to.have.property('pastYearTotalUniquePageviews', 0)
          chaiExpect(mediaRef).to.have.property('pastAllTimeTotalUniquePageviews', 0)
          chaiExpect(mediaRef).to.have.property('startTime', 480)
          chaiExpect(mediaRef).to.have.property('title', 'Consectetur lorem donec massa sapien faucibus et molestie ac. Purus semper eget duis at tellus.')
          chaiExpect(mediaRef).to.have.property('createdAt', '2020-03-02T22:13:33.820Z')
          chaiExpect(mediaRef).to.have.property('updatedAt', '2020-03-02T22:13:33.820Z')
          
          

          done()
        })
    })
    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/episode/gRgjd3asdfYcKb`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body).to.have.property('message', 'Episode not found')

          done()
        })
    })
  })

})
