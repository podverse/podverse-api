import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('AccountClaimToken endpoints', () => {

  describe('get by id', () => {
    test('when an unclaimed id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/claim-account/6fc489b1-46b1-4f89-8734-e2f3725da3d8`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          chaiExpect(res.body.id).to.equal('6fc489b1-46b1-4f89-8734-e2f3725da3d8')
          chaiExpect(res.body.claimed).to.equal(false)
          chaiExpect(res.body.yearsToAdd).to.equal(100)
          chaiExpect(Object.keys(res.body).length).to.equal(3)

          done()
        })
    })

    test('when a claimed id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/claim-account/faae1a5f-260a-40d7-89d5-fb1c48d75735`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(400);

          chaiExpect(res.body.message).to.equal('This token has already been claimed.')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })
  
  describe('redeem by id', () => {

    const sendBody1 = {
      "id": "6fc489b1-46b1-4f89-8734-e2f3725da3d8",
      "email": "accountClaimTokenTest@stage.podverse.fm"
    }
    const sendBody2 = {
      "id": "faae1a5f-260a-40d7-89d5-fb1c48d75735",
      "email": "accountClaimTokenTest@stage.podverse.fm"
    }
    const sendBody3 = {
      "id": "6fc489bz-46b1-4f89-8734-e2f3725da3d8",
      "email": "accountClaimTokenTest@stage.podverse.fm"
    }

    test('valid redeem', async (done) => {
      chai.request(global.app)
        .post(`${v1Path}/claim-account`)
        .send(sendBody1)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          done()
        })
    })

    test('claimed redeem', async (done) => {
      chai.request(global.app)
        .post(`${v1Path}/claim-account`)
        .send(sendBody2)
        .end((err, res) => {
          chaiExpect(res).to.have.status(400);

          chaiExpect(res.body.message).to.equal('This offer has already been claimed.')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })

    test('invalid redeem', async (done) => {
      chai.request(global.app)
        .post(`${v1Path}/claim-account`)
        .send(sendBody3)
        .end((err, res) => {
          chaiExpect(res).to.have.status(500);

          chaiExpect(res.body.message).to.equal('invalid input syntax for type uuid: \"6fc489bz-46b1-4f89-8734-e2f3725da3d8\"')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })

  })

})
