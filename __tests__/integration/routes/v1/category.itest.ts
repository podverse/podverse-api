import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_category endpoints', () => {

  describe('get by id', () => {
    test('when a valid parent category id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/category/oqttP672MM`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body.id).to.equal('oqttP672MM')
          chaiExpect(res.body.fullPath).to.equal('Health & Fitness')
          chaiExpect(res.body.slug).to.equal('healthfitness')
          chaiExpect(res.body.title).to.equal('Health & Fitness')
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')
          chaiExpect(res.body.category).to.equal(null)

          const category0 = res.body.categories[0]
          const category1 = res.body.categories[1]
          const category2 = res.body.categories[2]
          const category3 = res.body.categories[3]
          const category4 = res.body.categories[4]

          chaiExpect(category0.id).to.equal('nzFoXinvP3')
          chaiExpect(category0.fullPath).to.equal('Health & Fitness>Mental Health')
          chaiExpect(category0.slug).to.equal('mentalhealth')
          chaiExpect(category0.title).to.equal('Mental Health')
          chaiExpect(category0).to.have.property('createdAt')
          chaiExpect(category0).to.have.property('updatedAt')

          chaiExpect(category1.id).to.equal('HOg7j7SXhk')
          chaiExpect(category1.fullPath).to.equal('Health & Fitness>Alternative Health')
          chaiExpect(category1.slug).to.equal('alternativehealth')
          chaiExpect(category1.title).to.equal('Alternative Health')
          chaiExpect(category1).to.have.property('createdAt')
          chaiExpect(category1).to.have.property('updatedAt')

          chaiExpect(category2.id).to.equal('6jKTcMdGMP')
          chaiExpect(category2.fullPath).to.equal('Health & Fitness>Fitness')
          chaiExpect(category2.slug).to.equal('fitness')
          chaiExpect(category2.title).to.equal('Fitness')
          chaiExpect(category2).to.have.property('createdAt')
          chaiExpect(category2).to.have.property('updatedAt')

          chaiExpect(category3.id).to.equal('P22Q8lwUOe')
          chaiExpect(category3.fullPath).to.equal('Health & Fitness>Medicine')
          chaiExpect(category3.slug).to.equal('medicine')
          chaiExpect(category3.title).to.equal('Medicine')
          chaiExpect(category3).to.have.property('createdAt')
          chaiExpect(category3).to.have.property('updatedAt')

          chaiExpect(category4.id).to.equal('jvtAuDcnCv')
          chaiExpect(category4.fullPath).to.equal('Health & Fitness>Nutrition')
          chaiExpect(category4.slug).to.equal('nutrition')
          chaiExpect(category4.title).to.equal('Nutrition')
          chaiExpect(category4).to.have.property('createdAt')
          chaiExpect(category4).to.have.property('updatedAt')

          chaiExpect(Object.keys(res.body).length).to.equal(9)


          done()
        })

    })

    test('when a valid child category id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/category/HOg7j7SXhk`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body.id).to.equal('HOg7j7SXhk')
          chaiExpect(res.body.fullPath).to.equal('Health & Fitness>Alternative Health')
          chaiExpect(res.body.slug).to.equal('alternativehealth')
          chaiExpect(res.body.title).to.equal('Alternative Health')
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')

          const category = res.body.category
          chaiExpect(category.id).to.equal('oqttP672MM')
          chaiExpect(category.fullPath).to.equal('Health & Fitness')
          chaiExpect(category.slug).to.equal('healthfitness')
          chaiExpect(category.title).to.equal('Health & Fitness')
          chaiExpect(category).to.have.property('createdAt')
          chaiExpect(category).to.have.property('updatedAt')
          chaiExpect(category.category).to.equal(null)

          chaiExpect(res.body.categories).to.eql([])

          chaiExpect(Object.keys(res.body).length).to.equal(9)

          done()
        })
    })
    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/category/2ELHNasdnfE9Y`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.equal('Category not found')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('find by query', () => {
    test('top past week', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/category?page=&sort=top-past-week`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          const category = res.body[0][0]
          
          chaiExpect(category.id).to.equal('H3kmMlJAPE')
          chaiExpect(category.slug).to.equal('aftershows')
          chaiExpect(category.title).to.equal('After Shows')

          chaiExpect(category.category.id).to.equal('fEVhFxQCz')
          chaiExpect(category.category.fullPath).to.equal('TV & Film')
          chaiExpect(category.category.slug).to.equal('tvfilm')
          chaiExpect(category.category.title).to.equal('TV & Film')
          chaiExpect(category.category).to.have.property('createdAt')
          chaiExpect(category.category).to.have.property('updatedAt')

          chaiExpect(category.categories).to.eql([])

          chaiExpect(Object.keys(res.body).length).to.equal(2)
                
          done()
        })
    })
  })

})
