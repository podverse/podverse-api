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
        .get(
          `${v1Path}/clips?mediaUrl=https://dts.podtrac.com/redirect.mp3/www.buzzsprout.com/1/814110-7-launch-your-new-podcast.mp3?blob_id=1707517`
        )
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          chaiExpect(res.body.version).to.equal('1.0.0')

          const chapter0 = res.body.chapters[0]

          chaiExpect(chapter0.endTime).to.equal(30)
          chaiExpect(chapter0.startTime).to.equal(0)
          chaiExpect(chapter0.title).to.equal('First soundbite')

          const chapter1 = res.body.chapters[1]

          chaiExpect(chapter1.endTime).to.equal(207)
          chaiExpect(chapter1.startTime).to.equal(122)
          chaiExpect(chapter1.title).to.equal('Some soundbite title')

          const chapter2 = res.body.chapters[2]

          chaiExpect(chapter2.endTime).to.equal(360)
          chaiExpect(chapter2.startTime).to.equal(240)
          chaiExpect(chapter2.title).to.equal('Another soundbite title')

          const chapter3 = res.body.chapters[3]

          chaiExpect(chapter3.endTime).to.equal(632)
          chaiExpect(chapter3.startTime).to.equal(482)
          chaiExpect(chapter3.title).to.equal('One more soundbite title')

          const chapter4 = res.body.chapters[4]

          chaiExpect(chapter4.endTime).to.equal(735)
          chaiExpect(chapter4.startTime).to.equal(555)

          chaiExpect(Object.keys(res.body).length).to.equal(2)

          done()
        })
    })
  })
})
