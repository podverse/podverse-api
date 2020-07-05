import * as chai from 'chai'
import chaiHttp = require('chai-http')
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('accountClaimToken endpoints', () => {
  describe('get by id', () => {
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get('/claim-account')
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          done()
        })
    })
  })
})
