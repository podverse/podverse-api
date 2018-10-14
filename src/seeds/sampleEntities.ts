import { Connection } from 'typeorm'
import { Author, Category, Episode, FeedUrl, MediaRef, Playlist,
  Podcast, User } from 'entities'
import { connectToDb } from 'lib/db'

const seedDatabase = async (connection: Connection) => {
  await connection.synchronize(true)

  let author1 = new Author()
  author1.name = 'Roadrunner'

  let author2 = new Author()
  author2.name = 'Bugs Bunny'

  let author3 = new Author()
  author3.name = 'Elmer Fudd'

  let author4 = new Author()
  author4.name = 'Porky Pig'

  let category1 = new Category()
  category1.title = 'Test Category 1'

  let category2 = new Category()
  category2.title = 'Test Category 2'

  let user1 = new User()
  user1.email = 'foghorn@looney.tunes'
  user1.name = 'Foghorn Leghorn'
  user1.password = 'Aa!1asdf'

  let user2 = new User()
  user2.email = 'sylvester@looney.tunes'
  user2.name = 'Sylvester the Cat'
  user2.password = 'Aa!1asdf'

  let user3 = new User()
  user3.email = 'tweety@looney.tunes'
  user3.name = 'Tweety'
  user3.password = 'Aa!1asdf'

  let user4 = new User()
  user4.email = 'wile@looney.tunes'
  user4.name = 'Wile E. Coyote'
  user4.password = 'Aa!1asdf'

  let playlist1 = new Playlist()
  playlist1.owner = user1
  playlist1.title = 'Greatest Hits'

  const podcast = new Podcast()
  podcast.title = 'The James Altucher Show'
  podcast.imageUrl = 'http://static.libsyn.com/p/assets/b/4/6/3/b463232a6b0b641c/James-Altucher-iTunes.jpg'
  podcast.description = 'This is not your average business podcast. James Altucher interviews the world’s leading peak performers in every area of life. But instead of giving you the typical success story, James digs deeper to find the “Choose Yourself” story—these are the moments we relate to…. when someone rises up from personal struggle to reinvent themselves. The James Altucher Show brings you into the lives of peak-performers, billionaires, best-selling authors, writers, rappers, astronauts and more, all who forged their own paths, found financial freedom, and harnessed the power to create more meaningful and fulfilling lives.'
  podcast.lastEpisodePubDate = new Date()
  podcast.lastEpisodeTitle = '399 - Neil deGrasse Tyson: What is The Truth ? The Real Science of Inquiry'
  podcast.authors = [author1, author2, author3, author4]
  podcast.categories = [category1, category2]

  const episode = new Episode()
  episode.mediaUrl = 'http://traffic.libsyn.com/altucher/JAS-220-MattMullenweg-v01-FREE.mp3?dest-id=172343'
  episode.title = 'Ep. 220 - Matt Mullenweg: Do You Have Your Own Internal "Code"'
  episode.description = `<p>I have a rule. After every podcast, I write down 10 things I learned. I don't know if anyone else does this. Do you do this? Some people make illustrations. They send me what they've learned. It's a creation of a creation of a creation. A drawing of a podcast of someone's life.</p> <p> </p> <p><span style="font-weight: 400;">But I broke my rule. It's been over a month. And my brain is digging for the lessons from my interview with the creator of Wordpress. I think I have Alzheimer’s. Matt was 19 years old when he started Wordpress. It was 2003. Now Wordpress.com </span><span style= "font-weight: 400;">gets more traffic than</span> <span style= "font-weight: 400;">Amazon.com</span><span style= "font-weight: 400;">.</span></p> <p> </p> <p><span style="font-weight: 400;">The Wall Street Journal and The New York Times both use Wordpress. I use Wordpress.</span></p> <p> </p> <p><span style="font-weight: 400;">I wanted to know if it’s still worth the time and effort to make your own site. He said it is. That’s how you break out...</span></p> <p> </p> <p><span style="font-weight: 400;">"We're trying to revitalize the independent web,” Matt Mullenweg said. He’s 33 now. "It's not like these big sites are going anywhere. They're fantastic. I use all of them, but you want balance. You need your own site that belongs to you... like your own home on the Internet."</span></p> <p> </p> <p><span style="font-weight: 400;">This is part of Matt’s code. Not Wordpress’s “code.” Matt’s like a robot. I mean that as a compliment. There are many signs of this: language, ability, he’s very exact.</span></p> <p> </p> <p><span style="font-weight: 400;">I had to interrupt. He was talking in code. And it was my job to translate.</span></p> <p> </p> <p><span style="font-weight: 400;">He said, "If I send you a unit of work...”</span></p> <p> </p> <p><span style="font-weight: 400;">"I don't mean to interrupt,” I said. “I'm a little bit of an interrupter. So I apologize in advance, but you talk in a very code-like language…</span> <em><span style="font-weight: 400;">'a unit of work.’</span></em> <span style="font-weight: 400;">How about ‘a task?’ That works as well."</span></p> <p> </p> <p><span style="font-weight: 400;">He laughed. And thanked me for translating. The podcast continued.</span></p> <p> </p> <p><span style="font-weight: 400;">He told me about his personal code (again, robot).</span></p> <p> </p> <p><span style="font-weight: 400;">People have values. Geniuses and other advanced forms of life  have “code.” So here’s Matt’s...</span></p> <p> A) Measure what’s important to you.</p> <p> </p> <p><span style="font-weight: 400;">Matt wrote a birthday blog. He does this every year to measure what’s changed. It lists how many books he’s read over the past year, countries he traveled to and so on.</span></p> <p> </p> <p><span style="font-weight: 400;">He’s very specific.</span></p> <p> </p> <p><span style="font-weight: 400;">It’s a measurement of his personal freedom. He can see where time went. And if he chose himself. “You cannot change what you don’t measure,” Matt said.</span></p> <p> </p> <p><span style="font-weight: 400;">So this year,</span> I wrote a birthday blog<span style="font-weight: 400;">.</span></p> <p><strong> B) Own the work you do</strong></p> <p><span style="font-weight: 400;">"Other sites provide space,” he said. “They provide distribution in exchange for owning all of your stuff. You can't leave Facebook or Twitter and take all of your followers with you."</span></p> <p> </p> <p><span style="font-weight: 400;">That’s why he recommends having your own website. It’s yours. Not Facebook’s. Not Business Insider’s or Huffington Post’s. It’s yours.</span></p> <p> </p> <p><span style="font-weight: 400;">When I first started jamesaltucher.com, I picked a template, posted a blog, shared a link on Twitter and within 3-4 minutes I had traffic.</span></p> <p> C) Ignore concern</p> <p><span style="font-weight: 400;">Matt dropped out of college and moved to San Francisco when he was 20.</span></p> <p> </p> <p><span style="font-weight: 400;">“Were your parents upset?”</span></p> <p> </p> <p><span style="font-weight: 400;">“They’ve always been supportive,” he said. “But they were concerned.”</span></p> <p> </p> <p><span style="font-weight: 400;">That didn’t stop him. He had direction. And when you know where you’re going, you don’t ask for directions.</span></p> <p> </p> <p><span style="font-weight: 400;">Sometimes I feel like I’m driving with the wrong address in my GPS. And Siri won’t stop re-routing.</span></p> <p> </p> <p><span style="font-weight: 400;">So what I learned from Matt: Reroute yourself as many times as it takes. Reinvent.</span></p> <p> </p> <p><span style="font-weight: 400;">Put someone else’s concern for your wellbeing on your gratitude list. But don’t let it stop you. Don’t let it get in the way of your code.</span></p> <p> D) The myth of loyalty</p> <p><span style="font-weight: 400;">When Matt moved and started his first job, he made more than his dad did.</span></p> <p> </p> <p><span style="font-weight: 400;">“I got an amazing salary,” he said.</span></p> <p> </p> <p><span style="font-weight: 400;">I kept wondering if his parents were upset. I don’t know why.</span></p> <p> </p> <p><span style="font-weight: 400;">“Were they upset?”</span></p> <p> </p> <p><span style="font-weight: 400;">He said no. Again. But then he explained. “Learning spreads organically.” And when he moved, it helped spark possibility for his dad.</span></p> <p> </p> <p><span style="font-weight: 400;">“He worked at the same company for 26 or 27 years. He more than doubled his salary when he left. It made me so sad. I never want anyone to be in the situation my dad was in,” he said. “He gave the loyalty of decades and they didn’t return that loyalty…”</span></p> <p> </p> <p><span style="font-weight: 400;">Why? Because they were following a different code. The “employee code” is not the same as the “employer code.”</span></p> <p> </p> <p><span style="font-weight: 400;">I don’t measure much. I try to let my life float by. And I hope to help people feel free enough to live by their own codes too. Like Matt and his dad.</span></p> <p> </p> <p><span style="font-weight: 400;">That’s how I measure what’s important to me. Am I supportive? Of myself and of others? If yes, then I’m a mix of creation and evolution. Robot and human.</span></p> <p> </p> <p><span style="font-weight: 400;">Code and DNA.</span></p> <p><br /> <br /></p>`
  episode.pubDate = new Date()
  episode.podcast = podcast
  episode.authors = [author1, author2, author3, author4]
  episode.categories = [category1, category2]

  const feedUrl = new FeedUrl()
  feedUrl.podcast = podcast
  feedUrl.url = 'http://altucher.stansberry.libsynpro.com/rss'
  feedUrl.isAuthority = true

  const mediaRef = new MediaRef()
  mediaRef.endTime = 934
  mediaRef.startTime = 853
  mediaRef.title = 'Matt Mullenweg, the creator of Wordpress, on the four freedoms of the GPL open source software license'
  mediaRef.episodeDescription = `<p>I have a rule. After every podcast, I write down 10 things I learned. I don't know if anyone else does this. Do you do this? Some people make illustrations. They send me what they've learned. It's a creation of a creation of a creation. A drawing of a podcast of someone's life.</p> <p> </p> <p><span style="font-weight: 400;">But I broke my rule. It's been over a month. And my brain is digging for the lessons from my interview with the creator of Wordpress. I think I have Alzheimer’s. Matt was 19 years old when he started Wordpress. It was 2003. Now Wordpress.com </span><span style= "font-weight: 400;">gets more traffic than</span> <span style= "font-weight: 400;">Amazon.com</span><span style= "font-weight: 400;">.</span></p> <p> </p> <p><span style="font-weight: 400;">The Wall Street Journal and The New York Times both use Wordpress. I use Wordpress.</span></p> <p> </p> <p><span style="font-weight: 400;">I wanted to know if it’s still worth the time and effort to make your own site. He said it is. That’s how you break out...</span></p> <p> </p> <p><span style="font-weight: 400;">"We're trying to revitalize the independent web,” Matt Mullenweg said. He’s 33 now. "It's not like these big sites are going anywhere. They're fantastic. I use all of them, but you want balance. You need your own site that belongs to you... like your own home on the Internet."</span></p> <p> </p> <p><span style="font-weight: 400;">This is part of Matt’s code. Not Wordpress’s “code.” Matt’s like a robot. I mean that as a compliment. There are many signs of this: language, ability, he’s very exact.</span></p> <p> </p> <p><span style="font-weight: 400;">I had to interrupt. He was talking in code. And it was my job to translate.</span></p> <p> </p> <p><span style="font-weight: 400;">He said, "If I send you a unit of work...”</span></p> <p> </p> <p><span style="font-weight: 400;">"I don't mean to interrupt,” I said. “I'm a little bit of an interrupter. So I apologize in advance, but you talk in a very code-like language…</span> <em><span style="font-weight: 400;">'a unit of work.’</span></em> <span style="font-weight: 400;">How about ‘a task?’ That works as well."</span></p> <p> </p> <p><span style="font-weight: 400;">He laughed. And thanked me for translating. The podcast continued.</span></p> <p> </p> <p><span style="font-weight: 400;">He told me about his personal code (again, robot).</span></p> <p> </p> <p><span style="font-weight: 400;">People have values. Geniuses and other advanced forms of life  have “code.” So here’s Matt’s...</span></p> <p> A) Measure what’s important to you.</p> <p> </p> <p><span style="font-weight: 400;">Matt wrote a birthday blog. He does this every year to measure what’s changed. It lists how many books he’s read over the past year, countries he traveled to and so on.</span></p> <p> </p> <p><span style="font-weight: 400;">He’s very specific.</span></p> <p> </p> <p><span style="font-weight: 400;">It’s a measurement of his personal freedom. He can see where time went. And if he chose himself. “You cannot change what you don’t measure,” Matt said.</span></p> <p> </p> <p><span style="font-weight: 400;">So this year,</span> I wrote a birthday blog<span style="font-weight: 400;">.</span></p> <p><strong> B) Own the work you do</strong></p> <p><span style="font-weight: 400;">"Other sites provide space,” he said. “They provide distribution in exchange for owning all of your stuff. You can't leave Facebook or Twitter and take all of your followers with you."</span></p> <p> </p> <p><span style="font-weight: 400;">That’s why he recommends having your own website. It’s yours. Not Facebook’s. Not Business Insider’s or Huffington Post’s. It’s yours.</span></p> <p> </p> <p><span style="font-weight: 400;">When I first started jamesaltucher.com, I picked a template, posted a blog, shared a link on Twitter and within 3-4 minutes I had traffic.</span></p> <p> C) Ignore concern</p> <p><span style="font-weight: 400;">Matt dropped out of college and moved to San Francisco when he was 20.</span></p> <p> </p> <p><span style="font-weight: 400;">“Were your parents upset?”</span></p> <p> </p> <p><span style="font-weight: 400;">“They’ve always been supportive,” he said. “But they were concerned.”</span></p> <p> </p> <p><span style="font-weight: 400;">That didn’t stop him. He had direction. And when you know where you’re going, you don’t ask for directions.</span></p> <p> </p> <p><span style="font-weight: 400;">Sometimes I feel like I’m driving with the wrong address in my GPS. And Siri won’t stop re-routing.</span></p> <p> </p> <p><span style="font-weight: 400;">So what I learned from Matt: Reroute yourself as many times as it takes. Reinvent.</span></p> <p> </p> <p><span style="font-weight: 400;">Put someone else’s concern for your wellbeing on your gratitude list. But don’t let it stop you. Don’t let it get in the way of your code.</span></p> <p> D) The myth of loyalty</p> <p><span style="font-weight: 400;">When Matt moved and started his first job, he made more than his dad did.</span></p> <p> </p> <p><span style="font-weight: 400;">“I got an amazing salary,” he said.</span></p> <p> </p> <p><span style="font-weight: 400;">I kept wondering if his parents were upset. I don’t know why.</span></p> <p> </p> <p><span style="font-weight: 400;">“Were they upset?”</span></p> <p> </p> <p><span style="font-weight: 400;">He said no. Again. But then he explained. “Learning spreads organically.” And when he moved, it helped spark possibility for his dad.</span></p> <p> </p> <p><span style="font-weight: 400;">“He worked at the same company for 26 or 27 years. He more than doubled his salary when he left. It made me so sad. I never want anyone to be in the situation my dad was in,” he said. “He gave the loyalty of decades and they didn’t return that loyalty…”</span></p> <p> </p> <p><span style="font-weight: 400;">Why? Because they were following a different code. The “employee code” is not the same as the “employer code.”</span></p> <p> </p> <p><span style="font-weight: 400;">I don’t measure much. I try to let my life float by. And I hope to help people feel free enough to live by their own codes too. Like Matt and his dad.</span></p> <p> </p> <p><span style="font-weight: 400;">That’s how I measure what’s important to me. Am I supportive? Of myself and of others? If yes, then I’m a mix of creation and evolution. Robot and human.</span></p> <p> </p> <p><span style="font-weight: 400;">Code and DNA.</span></p> <p><br /> <br /></p>`
  mediaRef.episodeLinkUrl = 'https://jamesaltucher.com/'
  mediaRef.episodeMediaUrl = 'http://traffic.libsyn.com/altucher/JAS-220-MattMullenweg-v01-FREE.mp3?dest-id=172343'
  mediaRef.podcastFeedUrl = 'http://altucher.stansberry.libsynpro.com/rss'
  mediaRef.podcastImageUrl = 'http://static.libsyn.com/p/assets/b/4/6/3/b463232a6b0b641c/James-Altucher-iTunes.jpg'
  mediaRef.podcastTitle = 'The James Altucher Show'
  mediaRef.authors = [author1, author2, author3, author4]
  mediaRef.categories = [category1, category2]
  mediaRef.episode = episode
  mediaRef.owner = user1

  await connection.manager.save([author1, author2, author3, author4, category1, category2, user1, user2, user3, user4, playlist1, podcast, episode, mediaRef, feedUrl])
}

connectToDb()
  .then(async connection => {
    if (connection) {
      await seedDatabase(connection)
    }
  })
