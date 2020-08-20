import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_category endpoints', () => {

  describe('get by id', () => {
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/category/2ELHNnfE9Y`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body).to.have.property('id', '2ELHNnfE9Y')
          chaiExpect(res.body).to.have.property('fullPath', 'Arts>Design')
          chaiExpect(res.body).to.have.property('slug', 'design')
          chaiExpect(res.body).to.have.property('title', 'Design')
          chaiExpect(res.body).to.have.property('createdAt', '2020-04-03T06:49:43.343Z')
          chaiExpect(res.body).to.have.property('updatedAt', '2020-04-03T06:49:43.343Z')

          const category = res.body.category[0]
          chaiExpect(category).to.have.property('id', 'jeW7cF_Pv')
          chaiExpect(category).to.have.property('fullPath', 'Arts')
          chaiExpect(category).to.have.property('slug', 'arts')
          chaiExpect(category).to.have.property('title', 'Arts')
          chaiExpect(category).to.have.property('createdAt', '2020-04-03T06:49:43.272Z')
          chaiExpect(category).to.have.property('updatedAt', '2020-04-03T06:49:43.272Z')
          chaiExpect(category).to.have.property('category', null)

          //categories
          
          

          done()
        })
    })
    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/category/2ELHNasdnfE9Y`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body).to.have.property('message', 'Category not found')
          

          done()
        })
    })
  })

})
