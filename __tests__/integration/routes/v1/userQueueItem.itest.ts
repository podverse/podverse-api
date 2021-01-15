import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_author endpoints', () => {

  describe('get by id', () => {
    const sendbody = {
      "episodeId": "n43uIo6zR8",
      "mediaRefId": "jE4kZmZhl9",
      "queuePosition": 0
  }
    test('when a valid parent category id is provided', async (done) => {
      chai.request(global.app)
        .patch(`${v1Path}/user-queue-item`)
        .send(sendbody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          
          chaiExpect(Object.keys(res.body).length).to.equal(0)

          done()
        })
    })
  })

})

