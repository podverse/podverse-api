import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_user endpoints', () => {

  describe('get by id', () => {
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/user/EVHDBRZY`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body).to.have.property('id', 'EVHDBRZY')
          chaiExpect(res.body).to.have.property('isPublic', true)
          chaiExpect(res.body).to.have.property('name', 'Free Trial Valid - Test User')

          //subscribedPodcastId
          
          

          done()
        })
    })
    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/user/EVHDBRgfdsaZY`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body).to.have.property('message', 'User not found.')
          
          done()
        })
    })
  })

})
