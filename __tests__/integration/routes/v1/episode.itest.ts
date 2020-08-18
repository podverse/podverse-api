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
          chaiExpect(res.body).to.have.property('title', '335- Gathering the Magic')
          chaiExpect(res.body).to.have.property('description')
          chaiExpect(res.body).to.have.property('isPublic', true)
          chaiExpect(res.body).to.have.property('duration', 0)

          const mediaRef = res.body.mediaRefs[0]
          chaiExpect(mediaRef).to.have.property('id', 'o0WTxqON')

          done()
        })
    })
  })

})
