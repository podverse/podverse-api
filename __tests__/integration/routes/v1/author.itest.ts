import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_author endpoints', () => {
  describe('get by id', () => {
    test('when a valid id is provided', async (done) => {
      chai
        .request(global.app)
        .get(`${v1Path}/author/Rk1zs7vs`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)
          chaiExpect(res.body.id).to.equal('Rk1zs7vs')
          chaiExpect(res.body.name).to.equal('Josh Zepps / Panoply')
          chaiExpect(res.body.slug).to.equal('joshzeppspanoply')
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')
          chaiExpect(Object.keys(res.body).length).to.equal(6)

          done()
        })
    })
    test('when an invalid id is provided', async (done) => {
      chai
        .request(global.app)
        .get(`${v1Path}/author/Rk1asdfzs7vs`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404)
          chaiExpect(res.body.message).to.equal('Author not found')
          chaiExpect(Object.keys(res.body).length).to.equal(1)

          done()
        })
    })
  })

  describe('find by query', () => {
    test('top past week', async (done) => {
      chai
        .request(global.app)
        .get(`${v1Path}/author?page=1&sort=top-past-week`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          const authors = res.body[0]
          const author = authors[0]

          chaiExpect(author.id).to.equal('Rk1zs7vs')
          chaiExpect(author.name).to.equal('Josh Zepps / Panoply')
          chaiExpect(author.slug).to.equal('joshzeppspanoply')
          chaiExpect(Object.keys(res.body).length).to.equal(2)

          done()
        })
    })
  })
})
