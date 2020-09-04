import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { testUsers, v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('Paypal endpoints', () => {

  describe('Create', () => {
    const sendBody = {
      "paymentID": "test"
    }
    test('logged out', async (done) => {
      chai.request(global.app)
        .post(`${v1Path}/paypal/order`)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401);

          done()
        })
    })
    test('logged in', async (done) => {
      chai.request(global.app)
        .post(`${v1Path}/paypal/order`)
        .set('Cookie', testUsers.premium.authCookie)
        .send(sendBody)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body.paymentID).to.equal('test')
          chaiExpect(res.body.owner).to.equal('QMReJmbE')
          chaiExpect(res.body.state).to.equal(null)
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')

          done()
        })
    })
  })
  describe('Get by ID', () => {
    test('logged out', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/paypal/order/test`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401);

          done()
        })
    })
    test('logged in', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/paypal/order/test`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body.paymentID).to.equal('test')
          chaiExpect(res.body.state).to.equal(null)
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')

          const owner = res.body.owner
          chaiExpect(owner.id).to.equal('QMReJmbE')
          chaiExpect(owner.isPublic).to.equal(true)
          chaiExpect(owner.name).to.equal('Premium Valid - Test User')

          done()
        })
    })
  })
})
