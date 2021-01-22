import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { testUsers, v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_userNowPlayingItem endpoints', () => {

  describe('Get Items', () => {
    test('Get', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/user-now-playing-item`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);

          chaiExpect(res.body.message).to.equal("No now playing item found")

          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

})

