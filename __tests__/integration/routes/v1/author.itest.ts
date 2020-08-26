import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_author endpoints', () => {

  describe('get by id', () => {
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/author/Rk1zs7vs`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body.id).to.equal('Rk1zs7vs')
          chaiExpect(res.body.name).to.equal('Josh Zepps / Panoply')
          chaiExpect(res.body.slug).to.equal('joshzeppspanoply')
          chaiExpect(res.body.createdAt).to.equal('2020-03-02T21:17:06.822Z')
          chaiExpect(res.body.updatedAt).to.equal('2020-03-02T21:17:06.822Z')
                
          done()
        })
    })
    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/author/Rk1asdfzs7vs`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.equal('Author not found')
                
          done()
        })
    })
  })

})
