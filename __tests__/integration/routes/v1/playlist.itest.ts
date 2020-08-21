import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_playlist endpoints', () => {

  describe('get by id', () => {
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/playlist/CH_2-LlM`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body.id).to.eql('CH_2-LlM')
          chaiExpect(res.body).to.have.property('description')
          chaiExpect(res.body.isPublic).to.eql(false)
          chaiExpect(res.body.itemCount).to.eql(2)
          chaiExpect(res.body.itemsOrder).to.eql([])
          chaiExpect(res.body.title).to.eql('Premium - Test Playlist 2')
          chaiExpect(res.body.createdAt).to.eql('2020-03-02T22:38:21.768Z')
          chaiExpect(res.body.updatedAt).to.eql('2020-05-26T01:22:00.712Z')
          chaiExpect(res.body.episodes).to.eql([])

          const mediaRef = res.body.mediaRefs[0]
          const episode = res.body.mediaRefs[0].episode
          chaiExpect(mediaRef.id).to.eql('6UFQc7Lq')
          chaiExpect(mediaRef.endTime).to.eql(1496)
          chaiExpect(mediaRef.isPublic).to.eql(true)
          chaiExpect(mediaRef.pastHourTotalUniquePageviews).to.eql(2)
          chaiExpect(mediaRef.pastDayTotalUniquePageviews).to.eql(3)
          chaiExpect(mediaRef.pastWeekTotalUniquePageviews).to.eql(4)
          chaiExpect(mediaRef.pastMonthTotalUniquePageviews).to.eql(5)
          chaiExpect(mediaRef.pastYearTotalUniquePageviews).to.eql(6)
          chaiExpect(mediaRef.pastAllTimeTotalUniquePageviews).to.eql(7)
          chaiExpect(mediaRef.startTime).to.eql(1366)
          chaiExpect(mediaRef.title).to.eql('Viverra orci sagittis eu volutpat odio facilisis mauris sit.')
          chaiExpect(mediaRef.createdAt).to.eql('2020-03-02T22:27:41.585Z')
          chaiExpect(mediaRef.updatedAt).to.eql('2020-03-02T23:00:42.173Z')

          chaiExpect(episode.id).to.eql('4uE26PEF_y')
          chaiExpect(episode).to.have.property('description')
          chaiExpect(episode.duration).to.eql(0)
          chaiExpect(episode.episodeType).to.eql('full')
          
          

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/playlist/CH_2-LasdflM`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.eql('Playlist not found')

          done()
        })
    })
  })

})
