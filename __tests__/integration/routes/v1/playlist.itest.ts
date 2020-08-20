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
          chaiExpect(res.body).to.have.property('id', 'CH_2-LlM')
          chaiExpect(res.body).to.have.property('description')
          chaiExpect(res.body).to.have.property('isPublic', false)
          chaiExpect(res.body).to.have.property('itemCount', 2)
          //itemsOrder
          chaiExpect(res.body).to.have.property('title', 'Premium - Test Playlist 2')
          chaiExpect(res.body).to.have.property('createdAt', '2020-03-02T22:38:21.768Z')
          chaiExpect(res.body).to.have.property('updatedAt', '2020-05-26T01:22:00.712Z')
          //episodes

          const mediaRef = res.body.mediaRefs[0]
          chaiExpect(mediaRef).to.have.property('id', '6UFQc7Lq')
          chaiExpect(mediaRef).to.have.property('endTime', 1496)
          chaiExpect(mediaRef).to.have.property('isPublic', true)
          chaiExpect(mediaRef).to.have.property('pastHourTotalUniquePageviews', 2)
          chaiExpect(mediaRef).to.have.property('pastDayTotalUniquePageviews', 3)
          chaiExpect(mediaRef).to.have.property('pastWeekTotalUniquePageviews', 4)
          chaiExpect(mediaRef).to.have.property('pastMonthTotalUniquePageviews', 5)
          chaiExpect(mediaRef).to.have.property('pastYearTotalUniquePageviews', 6)
          chaiExpect(mediaRef).to.have.property('pastAllTimeTotalUniquePageviews', 7)
          chaiExpect(mediaRef).to.have.property('startTime', 1366)
          chaiExpect(mediaRef).to.have.property('title', 'Viverra orci sagittis eu volutpat odio facilisis mauris sit.')
          chaiExpect(mediaRef).to.have.property('createdAt', '2020-03-02T22:27:41.585Z')
          chaiExpect(mediaRef).to.have.property('updatedAt', '2020-03-02T23:00:42.173Z')
          
          

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/playlist/CH_2-LasdflM`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body).to.have.property('message', 'Playlist not found')

          done()
        })
    })
  })

})
