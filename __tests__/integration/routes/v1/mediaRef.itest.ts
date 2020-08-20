import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('_mediaRef endpoints', () => {

  describe('get by id', () => {
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/mediaRef/9rA5BhWp`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body).to.have.property('id', '9rA5BhWp')
          chaiExpect(res.body).to.have.property('endTime', 1680)
          chaiExpect(res.body).to.have.property('isPublic', true)
          chaiExpect(res.body).to.have.property('pastHourTotalUniquePageviews', 7)
          chaiExpect(res.body).to.have.property('pastDayTotalUniquePageviews', 8)
          chaiExpect(res.body).to.have.property('pastWeekTotalUniquePageviews', 9)
          chaiExpect(res.body).to.have.property('pastMonthTotalUniquePageviews', 0)
          chaiExpect(res.body).to.have.property('pastYearTotalUniquePageviews', 1)
          chaiExpect(res.body).to.have.property('pastAllTimeTotalUniquePageviews', 2)
          chaiExpect(res.body).to.have.property('startTime', 1500)
          chaiExpect(res.body).to.have.property('title', 'Amet aliquam id diam maecenas ultricies mi eget.')
          chaiExpect(res.body).to.have.property('createdAt', '2020-03-02T22:37:36.073Z')
          chaiExpect(res.body).to.have.property('updatedAt', '2020-03-02T22:58:19.378Z')
          //authors
          //categories
          

          const episode = res.body.episode[0]
          chaiExpect(episode).to.have.property('id', 'fFmGXkgIM')
          chaiExpect(episode).to.have.property('description')
          chaiExpect(episode).to.have.property('duration', 0)
          chaiExpect(episode).to.have.property('episodeType', 'full')
          chaiExpect(episode).to.have.property('guid', '465b2bdc-eebd-11e9-85c8-171e42a72b35')
          chaiExpect(episode).to.have.property('imageUrl', null)
          chaiExpect(episode).to.have.property('isExplicit', false)
          chaiExpect(episode).to.have.property('isPublic', true)
          chaiExpect(episode).to.have.property('linkUrl', null)
          chaiExpect(episode).to.have.property('mediaFilesize', 0)
          chaiExpect(episode).to.have.property('mediaType', 'audio/mpeg')
          chaiExpect(episode).to.have.property('mediaUrl', 'https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/chtbl.com/track/524GE/traffic.megaphone.fm/VMP3689667624.mp3')
          chaiExpect(episode).to.have.property('pastHourTotalUniquePageviews', 1)
          chaiExpect(episode).to.have.property('pastDayTotalUniquePageviews', 2)
          chaiExpect(episode).to.have.property('pastWeekTotalUniquePageviews', 3)
          chaiExpect(episode).to.have.property('pastMonthTotalUniquePageviews', 4)
          chaiExpect(episode).to.have.property('pastYearTotalUniquePageviews', 5)
          chaiExpect(episode).to.have.property('pastAllTimeTotalUniquePageviews', 6)
          chaiExpect(episode).to.have.property('pubDate', '2020-03-02T05:01:00.000Z')
          chaiExpect(episode).to.have.property('title', 'Jason Calacanis: TikTok should be banned, Tim Cook doesn\'t have enough \"chutzpah,\" and Uber will be fine')
          chaiExpect(episode).to.have.property('podcastId', 'zRo1jwx67')
          chaiExpect(episode).to.have.property('createdAt', '2020-03-02T21:17:39.462Z')
          chaiExpect(episode).to.have.property('updatedAt', '2020-04-03T06:52:52.361Z')

          
          

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/mediaRef/9rA5BasdfhWp`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body).to.have.property('message', 'MediaRef not found')

          done()
        })
    })
  })

})
