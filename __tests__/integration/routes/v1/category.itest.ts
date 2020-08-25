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
          chaiExpect(res.body.id).to.equal('2ELHNnfE9Y')
          chaiExpect(res.body.fullPath).to.equal('Arts>Design')
          chaiExpect(res.body.slug).to.equal('design')
          chaiExpect(res.body.title).to.equal('Design')
          chaiExpect(res.body.createdAt).to.equal('2020-04-03T06:49:43.343Z')
          chaiExpect(res.body.updatedAt).to.equal('2020-04-03T06:49:43.343Z')

          const category = res.body.category
          chaiExpect(category.id).to.equal('jeW7cF_Pv')
          chaiExpect(category.fullPath).to.equal('Arts')
          chaiExpect(category.slug).to.equal('arts')
          chaiExpect(category.title).to.equal('Arts')
          chaiExpect(category.createdAt).to.equal('2020-04-03T06:49:43.272Z')
          chaiExpect(category.updatedAt).to.equal('2020-04-03T06:49:43.272Z')
          chaiExpect(category.category).to.equal(null)

          chaiExpect(res.body.categories).to.eql([])

          //categories
          
          

          done()
        })
    })
    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/category/2ELHNasdnfE9Y`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.eql('Category not found')
          

          done()
        })
    })
  })

})
