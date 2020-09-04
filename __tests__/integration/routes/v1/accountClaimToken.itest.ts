import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('AccountClaimToken endpoints', () => {

  describe('get by id', () => {
    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/claim-account/ca11af89-af4e-4c39-9272-20d213895f77`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);

          chaiExpect(res.body.message).to.equal('AccountClaimToken not found')

          done()
        })
    })
  })

})
