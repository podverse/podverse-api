import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('accountClaimToken endpoints', () => {

  describe('get by id', () => {
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/claim-account`)
        .end((err, res) => {
          // TODO: this is a pointless test (405)
          // just here as an example
          chaiExpect(res).to.have.status(405);
          done()
        })
    })
  })

})
