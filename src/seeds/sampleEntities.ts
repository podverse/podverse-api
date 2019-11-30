require('dotenv').config()

import { hash } from 'bcryptjs'
import { Connection } from 'typeorm'
import { Author, Category, Episode, FeedUrl, MediaRef, Playlist, Podcast, User
  } from '~/entities'
import { config } from '~/config'
import { saltRounds } from '~/lib/constants'
import { connectToDb } from '~/lib/db'
const addSeconds = require('date-fns/add_seconds')
const { freeTrialExpiration, membershipExpiration } = config

const assetPath = process.env.USE_LIVE_ASSETS ? false : 'http://localhost:1234/public'

const seedDatabase = async (connection: Connection) => {
  const saltedPassword = await hash('Aa!1asdf', saltRounds)

  await connection.synchronize(true)

  let author1 = new Author()
  author1.name = 'James Altucher'

  let author2 = new Author()
  author2.name = 'Sam Harris'

  let author3 = new Author()
  author3.name = 'Tim Ferriss'

  let author4 = new Author()
  author4.name = 'Josh Szeps'

  let category1 = new Category()
  category1.fullPath = 'test-category1'
  category1.title = 'Test Category 1'

  let category2 = new Category()
  category2.fullPath = 'test-category2'
  category2.title = 'Test Category 2'

  let user1 = new User()
  user1.email = 'foghorn@looney.tunes'
  user1.name = 'Foghorn Leghorn'
  user1.password = saltedPassword
  user1.historyItems = []
  user1.queueItems = []
  user1.freeTrialExpiration = addSeconds(new Date(), freeTrialExpiration)
  user1.isPublic = true
  user1.emailVerified = true

  let user2 = new User()
  user2.email = 'sylvester@looney.tunes'
  user2.name = 'Sylvester the Cat'
  user2.password = saltedPassword
  user2.historyItems = []
  user2.queueItems = []
  user2.freeTrialExpiration = addSeconds(new Date(), 0)
  user2.membershipExpiration = addSeconds(new Date(), membershipExpiration)
  user2.isPublic = true
  user2.emailVerified = true

  let user3 = new User()
  user3.email = 'tweety@looney.tunes'
  user3.name = 'Tweety'
  user3.password = saltedPassword
  user3.historyItems = []
  user3.queueItems = []
  user3.freeTrialExpiration = addSeconds(new Date(), 0)
  user3.membershipExpiration = addSeconds(new Date(), 0)
  user3.isPublic = true
  user3.emailVerified = true

  let user4 = new User()
  user4.email = 'wile@looney.tunes'
  user4.name = 'Wile E. Coyote'
  user4.password = saltedPassword
  user4.historyItems = []
  user4.queueItems = []
  user4.freeTrialExpiration = addSeconds(new Date(), 259200)
  user4.isPublic = true
  user4.emailVerified = true

  let user5 = new User()
  user5.email = 'roadrunner@looney.tunes'
  user5.name = 'Roadrunner'
  user5.password = saltedPassword
  user5.historyItems = []
  user5.queueItems = []
  user5.membershipExpiration = addSeconds(new Date(), 259200)
  user5.isPublic = true
  user5.emailVerified = true

  let user6 = new User()
  user6.email = 'daffy@looney.tunes'
  user6.name = 'Daffy Duck'
  user6.password = saltedPassword
  user6.historyItems = []
  user6.queueItems = []
  user6.freeTrialExpiration = addSeconds(new Date(), 0)
  user6.isPublic = false
  user6.emailVerified = true

  let podcast = new Podcast()
  podcast.sortableTitle = 'james altucher show'
  podcast.title = 'The James Altucher Show'
  podcast.imageUrl = assetPath ? `${assetPath}/altucher.jpg` : 'http://static.libsyn.com/p/assets/b/4/6/3/b463232a6b0b641c/James-Altucher-iTunes.jpg'
  podcast.description = 'This is not your average business podcast. James Altucher interviews the world’s leading peak performers in every area of life. But instead of giving you the typical success story, James digs deeper to find the “Choose Yourself” story—these are the moments we relate to…. when someone rises up from personal struggle to reinvent themselves. The James Altucher Show brings you into the lives of peak-performers, billionaires, best-selling authors, writers, rappers, astronauts and more, all who forged their own paths, found financial freedom, and harnessed the power to create more meaningful and fulfilling lives.'
  podcast.lastEpisodePubDate = new Date(1490112340000)
  podcast.lastEpisodeTitle = 'Ep. 220 - Matt Mullenweg: Do You Have Your Own Internal "Code"'
  podcast.authors = [author1]
  podcast.categories = [category1, category2]
  podcast.isPublic = true

  const feedUrl = new FeedUrl()
  feedUrl.podcast = podcast
  feedUrl.url = assetPath ? `${assetPath}/altucher.rss` : 'http://altucher.stansberry.libsynpro.com/rss'
  feedUrl.isAuthority = true

  let podcast2 = new Podcast()
  podcast2.sortableTitle = 'waking up with sam harris'
  podcast2.title = 'Waking Up with Sam Harris'
  podcast2.imageUrl = assetPath ? `${assetPath}/wakingup.jpg` : 'http://static.libsyn.com/p/assets/0/b/e/4/0be4dc9e0fc61265/podcast_art_alt_1.5.18.jpg'
  podcast2.description = 'Join neuroscientist, philosopher, and best-selling author Sam Harris as he explores important and controversial questions about the human mind, society, and current events. Sam Harris is the author of The End of Faith, Letter to a Christian Nation, The Moral Landscape, Free Will, Lying, Waking Up, and Islam and the Future of Tolerance (with Maajid Nawaz). The End of Faith won the 2005 PEN Award for Nonfiction. His writing has been published in more than 20 languages. Mr. Harris and his work have been discussed in The New York Times, Time, Scientific American, Nature, Newsweek, Rolling Stone, and many other journals. His writing has appeared in The New York Times, The Los Angeles Times, The Economist, Newsweek, The Times (London), The Boston Globe, The Atlantic, The Annals of Neurology, and elsewhere. Mr. Harris received a degree in philosophy from Stanford University and a Ph.D. in neuroscience from UCLA.'
  podcast2.lastEpisodePubDate = new Date(1537428776000)
  podcast2.lastEpisodeTitle = '#138 — The Edge of Humanity'
  podcast2.authors = [author2]
  podcast2.categories = []
  podcast2.isPublic = true
  podcast2.isExplicit = true

  const feedUrl2 = new FeedUrl()
  feedUrl2.podcast = podcast2
  feedUrl2.url = assetPath ? `${assetPath}/wakingup.rss` : 'http://wakingup.libsyn.com/rss'
  feedUrl2.isAuthority = true

  let podcast3 = new Podcast()
  podcast3.sortableTitle = 'tim ferriss show'
  podcast3.title = 'The Tim Ferriss Show'
  podcast3.imageUrl = assetPath ? `${assetPath}/ferris.jpeg` : 'https://dfkfj8j276wwv.cloudfront.net/images/69/10/10/fb/691010fb-625e-4abe-993c-a57228b28dbe/91cb53ae0d5dbb379b9dffecf0a772593891d0d09bbe6d90ee746edbdb79e3ec75584f2ceb8260e9f675a90c05419b9b99842a76905b686f0f51c1a9d3e227ab.jpeg'
  podcast3.description = `Tim Ferriss is a self-experimenter and bestselling author, best known for The 4-Hour Workweek, which has been translated into 40+ languages. Newsweek calls him "the world's best human guinea pig, " and The New York Times calls him "a cross between Jack Welch and a Buddhist monk." In this show, he deconstructs world-class performers from eclectic areas (investing, chess, pro sports, etc.), digging deep to find the tools, tactics, and tricks that listeners can use.`
  podcast3.lastEpisodePubDate = new Date(1455671485000)
  podcast3.lastEpisodeTitle = 'Stewart Brand - The Polymath of Polymaths'
  podcast3.authors = [author3]
  podcast3.categories = []
  podcast3.isPublic = true

  const feedUrl3 = new FeedUrl()
  feedUrl3.podcast = podcast3
  feedUrl3.url = assetPath ? `${assetPath}/ferris.rss` : 'https://rss.art19.com/tim-ferriss-show'
  feedUrl3.isAuthority = true

  let episode = new Episode()
  episode.mediaUrl = assetPath ? `${assetPath}/altucher-1.mp3` : 'http://traffic.libsyn.com/altucher/JAS-220-MattMullenweg-v01-FREE.mp3?dest-id=172343'
  episode.title = 'Ep. 220 - Matt Mullenweg: Do You Have Your Own Internal "Code"'
  episode.description = `<p>I have a rule. After every podcast, I write down 10 things I learned. I don't know if anyone else does this. Do you do this? Some people make illustrations. They send me what they've learned. It's a creation of a creation of a creation. A drawing of a podcast of someone's life.</p> <p> </p> <p><span style="font-weight: 400;">But I broke my rule. It's been over a month. And my brain is digging for the lessons from my interview with the creator of Wordpress. I think I have Alzheimer’s. Matt was 19 years old when he started Wordpress. It was 2003. Now Wordpress.com </span><span style= "font-weight: 400;">gets more traffic than</span> <span style= "font-weight: 400;">Amazon.com</span><span style= "font-weight: 400;">.</span></p> <p> </p> <p><span style="font-weight: 400;">The Wall Street Journal and The New York Times both use Wordpress. I use Wordpress.</span></p> <p> </p> <p><span style="font-weight: 400;">I wanted to know if it’s still worth the time and effort to make your own site. He said it is. That’s how you break out...</span></p> <p> </p> <p><span style="font-weight: 400;">"We're trying to revitalize the independent web,” Matt Mullenweg said. He’s 33 now. "It's not like these big sites are going anywhere. They're fantastic. I use all of them, but you want balance. You need your own site that belongs to you... like your own home on the Internet."</span></p> <p> </p> <p><span style="font-weight: 400;">This is part of Matt’s code. Not Wordpress’s “code.” Matt’s like a robot. I mean that as a compliment. There are many signs of this: language, ability, he’s very exact.</span></p> <p> </p> <p><span style="font-weight: 400;">I had to interrupt. He was talking in code. And it was my job to translate.</span></p> <p> </p> <p><span style="font-weight: 400;">He said, "If I send you a unit of work...”</span></p> <p> </p> <p><span style="font-weight: 400;">"I don't mean to interrupt,” I said. “I'm a little bit of an interrupter. So I apologize in advance, but you talk in a very code-like language…</span> <em><span style="font-weight: 400;">'a unit of work.’</span></em> <span style="font-weight: 400;">How about ‘a task?’ That works as well."</span></p> <p> </p> <p><span style="font-weight: 400;">He laughed. And thanked me for translating. The podcast continued.</span></p> <p> </p> <p><span style="font-weight: 400;">He told me about his personal code (again, robot).</span></p> <p> </p> <p><span style="font-weight: 400;">People have values. Geniuses and other advanced forms of life  have “code.” So here’s Matt’s...</span></p> <p> A) Measure what’s important to you.</p> <p> </p> <p><span style="font-weight: 400;">Matt wrote a birthday blog. He does this every year to measure what’s changed. It lists how many books he’s read over the past year, countries he traveled to and so on.</span></p> <p> </p> <p><span style="font-weight: 400;">He’s very specific.</span></p> <p> </p> <p><span style="font-weight: 400;">It’s a measurement of his personal freedom. He can see where time went. And if he chose himself. “You cannot change what you don’t measure,” Matt said.</span></p> <p> </p> <p><span style="font-weight: 400;">So this year,</span> I wrote a birthday blog<span style="font-weight: 400;">.</span></p> <p><strong> B) Own the work you do</strong></p> <p><span style="font-weight: 400;">"Other sites provide space,” he said. “They provide distribution in exchange for owning all of your stuff. You can't leave Facebook or Twitter and take all of your followers with you."</span></p> <p> </p> <p><span style="font-weight: 400;">That’s why he recommends having your own website. It’s yours. Not Facebook’s. Not Business Insider’s or Huffington Post’s. It’s yours.</span></p> <p> </p> <p><span style="font-weight: 400;">When I first started jamesaltucher.com, I picked a template, posted a blog, shared a link on Twitter and within 3-4 minutes I had traffic.</span></p> <p> C) Ignore concern</p> <p><span style="font-weight: 400;">Matt dropped out of college and moved to San Francisco when he was 20.</span></p> <p> </p> <p><span style="font-weight: 400;">“Were your parents upset?”</span></p> <p> </p> <p><span style="font-weight: 400;">“They’ve always been supportive,” he said. “But they were concerned.”</span></p> <p> </p> <p><span style="font-weight: 400;">That didn’t stop him. He had direction. And when you know where you’re going, you don’t ask for directions.</span></p> <p> </p> <p><span style="font-weight: 400;">Sometimes I feel like I’m driving with the wrong address in my GPS. And Siri won’t stop re-routing.</span></p> <p> </p> <p><span style="font-weight: 400;">So what I learned from Matt: Reroute yourself as many times as it takes. Reinvent.</span></p> <p> </p> <p><span style="font-weight: 400;">Put someone else’s concern for your wellbeing on your gratitude list. But don’t let it stop you. Don’t let it get in the way of your code.</span></p> <p> D) The myth of loyalty</p> <p><span style="font-weight: 400;">When Matt moved and started his first job, he made more than his dad did.</span></p> <p> </p> <p><span style="font-weight: 400;">“I got an amazing salary,” he said.</span></p> <p> </p> <p><span style="font-weight: 400;">I kept wondering if his parents were upset. I don’t know why.</span></p> <p> </p> <p><span style="font-weight: 400;">“Were they upset?”</span></p> <p> </p> <p><span style="font-weight: 400;">He said no. Again. But then he explained. “Learning spreads organically.” And when he moved, it helped spark possibility for his dad.</span></p> <p> </p> <p><span style="font-weight: 400;">“He worked at the same company for 26 or 27 years. He more than doubled his salary when he left. It made me so sad. I never want anyone to be in the situation my dad was in,” he said. “He gave the loyalty of decades and they didn’t return that loyalty…”</span></p> <p> </p> <p><span style="font-weight: 400;">Why? Because they were following a different code. The “employee code” is not the same as the “employer code.”</span></p> <p> </p> <p><span style="font-weight: 400;">I don’t measure much. I try to let my life float by. And I hope to help people feel free enough to live by their own codes too. Like Matt and his dad.</span></p> <p> </p> <p><span style="font-weight: 400;">That’s how I measure what’s important to me. Am I supportive? Of myself and of others? If yes, then I’m a mix of creation and evolution. Robot and human.</span></p> <p> </p> <p><span style="font-weight: 400;">Code and DNA.</span></p> <p><br /> <br /></p>`
  episode.pubDate = new Date(1490112340000)
  episode.podcast = podcast
  episode.authors = [author1]
  episode.categories = [category1, category2]
  episode.isPublic = true

  let episode2 = new Episode()
  episode2.mediaUrl = assetPath ? `${assetPath}/wakingup-1.mp3` : 'http://traffic.libsyn.com/wakingup/Waking_Up_138_Harari.mp3?dest-id=480596'
  episode2.title = '#138 — The Edge of Humanity'
  episode2.description = `<p>In this episode of the Waking Up podcast, Sam Harris speaks with Yuval Noah Harari about his new book “21 Lessons for the 21st Century.” They discuss the importance of meditation for his intellectual life, the primacy of stories, the need to revise our fundamental assumptions about human civilization, the threats to liberal democracy, a world without work, universal basic income, the virtues of nationalism, the implications of AI and automation, and other topics.</p> <p>You can support the Waking Up Podcast and receive subscriber-only content at <a href= "https://samharris.org/subscribe/">SamHarris.org/subscribe</a>.</p>`
  episode2.pubDate = new Date(1537428776000)
  episode2.podcast = podcast2
  episode2.authors = [author2]
  episode2.categories = [category1, category2]
  episode2.isPublic = true
  episode2.isExplicit = true

  let episode3 = new Episode()
  episode3.mediaUrl = assetPath ? `${assetPath}/altucher-2.mp3` : 'http://traffic.libsyn.com/altucher/Adam20Grant20final20final20mp3.mp3?dest-id=172343'
  episode3.title = 'Ep. 154 - Adam Grant: What’s Next - How to Turn Your Idea into a (Successful) Business'
  episode3.description = `I don’t want to be afraid.<br /><br />But I am.<br /><br />I’ll explain why. But first, I want to introduce you to Adam Grant. He has the solution to my problem…<br /><br />And maybe your problem, too.<br /><br />Adam is the youngest tenured and highest-ranking professor at the famed business university The Wharton School, a writer for The New York Times, and the New York Times bestselling author of Give and Take: A Revolutionary Approach to Success.<br /><br />In researching his new book, Originals: How Non-Conformists Move the World, Adam met with today's most successful and innovative entrepreneurs. <br /><br />Why? To get answers.<br /><br />“We have a ton of guidance on how to generate ideas,” he says. But what about after? What do you do?<br /><br />Originals teaches you how to bring new ideas into the world.<br /><br />And really, there’s no grand theory on how to be "original." But there are tricks… And Adam discovered some patterns among today’s most successful entrepreneurs.<br /><br />He spoke to Google’s co-founder, Larry Page, Warby Parker’s founders and CEOs, and thought leaders like the renowned writer, Malcolm Gladwell.<br /><br />From Gladwell, Adam learned the most powerful technique to induce creativity. From Larry Page and the Warby Parker guys, he found a common thread. Hint: don’t quit your day job. But, more on that later.<br /><br />I’m going to tell you the top three things to be “an original.” They might surprise you. But first, I want you to know what else you’ll get from today’s podcast:<br /><br /><br /><br />How to get into a flow state (even during tasks you don’t like) [51:32] <br /><br /><br /><br /><br /><br />Should you plan your procrastination? [25:20] <br /><br />The most powerful techniques to immerse yourself and bring creativity into your life(including Malcolm Gladwell’s library trick) [20:06] <br /><br />Why the hell Adam Grant didn’t invest seed money in Warby Parker and become a billionaire [8:38] <br /><br />An ode to the idea muscle: why it’s more important to have quantity over quality ideas [28:19] <br /><br /><br /><br />Ok so here they are. The top three things to become "an original:"<br /><br />1) Induce creativity<br /><br />First unlearn. Then learn...<br /><br />We’ve all internalized things we need to question.<br /><br />That’s what adults do. We make up rules and reasons. We draw lines instead of pictures… tell “facts,” not stories.<br /><br />But why can’t we play with our food? Or stand on the counter?<br /><br />Kids think. Kids create.<br /><br />And we can get back to that too.<br /><br />We just have to unlearn. And then re-learn.<br /><br />“This comes back to our idea of broadening your experience and your knowledge,” Adam says. “You need to step outside of your field in order to see what you should be challenging.”<br /><br />Immerse yourself in new domains. Go beyond work… beyond your office… beyond the usual.<br /><br />Personally, I dabble in a lot of things. I play games. I write. I read. I'm involved in lots of businesses. And I recently tried stand-up comedy.<br /><br />“I've just pursued things I'm curious about,” Adam says, “and then unexpectedly, they turn out to have bridges between them.”<br /><br />That’s the key to learning. Do something new. Do a dare of the day. It’s good for your creative health. <br /><br />2) Don’t quit your day job (yet).<br /><br />Give yourself time to build your business. It worked for me. I tell why in this episode. Listen at [21:31].<br /><br />And be conservative. It’s one of the best ways to be original.<br /><br />“I was stunned actually,” Adam says. He read this a “nationally represented study of American entrepreneurs.” “People who did what you did, James, and kept their day job are 33% less likely to fail.”<br /><br />3) Propel your ideas forward<br /><br />Doubting your ideas can be paralyzing, so eliminate self-doubt. According to Adam, a lot of originals said, “Look, you could fail by starting a business that flops or you could fail by not starting a business at all, and I don't want to be in that second category."  Listen at [22:09] to get actionable steps to fight self-doubt.<br /><br /> <br /><br />Listen now.<br /><br />And let’s stop being afraid...<br /><br />Together.<br /><br />Resources and Links:<br /><br /><br /><br />Read Originals: How Non-Conformists Move the World by Adam Grant <br /><br />Listen to my last interview with Adam Grant here <br /><br />Read Give and Take: Why Helping Others Drives Our Success by Adam Grant <br /><br />Follow Adam on Facebook, Twitter, & visit his website www.adamgrant.net to read his articles.`
  episode3.pubDate = new Date(1455671485000)
  episode3.podcast = podcast
  episode3.authors = [author1]
  episode3.categories = [category1, category2]
  episode3.isPublic = true

  let episode4 = new Episode()
  episode4.mediaUrl = assetPath ? `${assetPath}/altucher-3.mp3` : 'http://traffic.libsyn.com/altucher/JAS-216-YuvalHarari-v01-FREE.mp3?dest-id=172343'
  episode4.title = 'Ep. 216 - Yuval Noah Harari: A Brief History of The Future'
  episode4.description = `<p>My ancestor from 70,000 years ago was smarter than me. He knew every plant, mushroom, animal, predator, prey in a several mile radius.</p> <p>He knew how to make weapons. He knew how to capture something, make it edible. I can barely order delivery. And as far as weapons, they say “the pen is mightier than the sword” but I don’t think a tweet is.</p> <p>My ancestor also knew how to adapt to new terrains, how to handle strangers who could be threats, how to learn who to trust and who not to trust. I wish I had his skills.</p> <p>Not only that. Archaeological evidence says his brain was bigger than mine. And bigger is better.</p> <p>To make things worse, another animal made the entire human race its slave. Wheat domesticated us. It forced us to stick around for the harvest, horde up for years when the harvest might be bad, go from a life of a diverse diet to basically all carbs all the time. And it turned us from hunters to farmers.</p> <p>But it’s not all bad. And the news is actually very good. Probably the books I’ve recommended most in the past five years was “Sapiens” by Yuval Harari. And not only me: it’s Bill Gates and Mark Zuckerberg’s top recommendation.</p> <p>And now Yuval has a new book, “Homo Deus” – i.e. where are humans heading? If Sapiens explored the last 70,000 years of human history, “Homo Deus” takes the trends into the future. What will happen next?</p> <p>The answers are fascinating. And I had even more questions. I couldn’t believe I was finally talking to Yuval after reading “Sapiens” so many times and recommending it on every list and giving the book to all of my friends. And then finally reading “Homo Deus“.</p> <p>What made humans the only animal to spread across the entire globe? What was special about us? How did we go hundreds of miles into empty water to find Australia for instance? I would never take that risk! And then survive and flourish in a completely new ecosystem, just like we did in North America.</p> <p>“Fiction,” Yuval told me, and describes in his book. “We created elaborate fictions for ourselves: ‘nations’, ‘corporations’, ‘religion’, ‘crusades’, and perhaps the most successful fiction: ‘money’. So I could use a dollar and some stranger in China can use a dollar and we can trust each other enough to do a transaction.”</p> <p>So what’s next? “Homo sapiens are going to evolve again.” Yuval said, “Technology is taking us there and technology is evolving much faster than we are.”</p> <p>I still can’t believe I spoke to him. Five years ago I took his course on Coursera. I was thinking, “how did this guy get so smart?” And now I was talking to him.</p> <p>And, like I said, the news was not bad.</p> <p>Here’s what I learned:</p> <p>1. The economy needs you to invest in yourself</p> <p>“There’s a change in the nature of the economy from a material based economy to a knowledge-based economy. The main assets in the past were material like gold minds or wheat fields,” Yuval said. “These are the types of things you can conquer through violence.”</p> <p>That’s how we got California. The US invaded and absorbed their wealth. But you can’t invade and absorb knowledge.</p> <p>China isn’t going to take over Silicon Valley and absorb all the wealth. “Today, the main asset is knowledge,” he said.</p> <p>The only good investment you can make for your future is the investment you make in yourself today.</p> <p>Hone your idea muscle, build a network and a library of mentors, make a commitment to do one healthy thing a day. Because the health of your body impacts the health of your brain.</p> <p>I try to improve 1% a day. That’s it. That’s how I invest in myself.</p> <p>2. Explore Internal realities vs. External realities</p> <p>Resources today are different. They’re abstract.</p> <p>Yuval said, “The source of wealth in California today is knowledge, in the mind’s of engineers and technicians and CEOs. And you just cannot conquer it by force.”</p> <p>That’s one of the reason’s why Yuval says, “You see a decline in international violence.”</p> <p>The other reason: weapons are too powerful.</p> <p>“Nuclear weapons have transformed war between superpowers,” he said. War today is “collective suicide, which is why we don’t have such wars since 1945.”</p> <p>Terrorism is different. Their weapon is fear. Yuval calls it “psychological menace.” But he’s really concerned about them in our future.</p> <p>“Terrorists function by capturing our imagination, turning our imagination against us, and causing us to overreact,” he said.</p> <p>“In a way, a terrorist is like a fly that tries to destroy a china shop. The fly is so small and weak. It cannot move even a single teacup. So how does a fly destroy a china shop? The fly finds a bull, gets into the ear of the bull and starts buzzing. The bull becomes so enraged that it loses its temper and destroys the china shop. This is what happened in the middle east over the last 15 years,” Yuval said.</p> <p>“Al-Qaeda could never destroy Iraq by itself. It got into the ear of the United States and the United States went wild and destroyed the middle eastern china shop for Al-Qaeda. This is how terrorism functions. And if you want to fight terrorism you should start with your own imagination.”</p> <p>For me, this means understanding that ideas are currency. Becoming an idea machine, writing ten ideas a day, so you get the new ‘weapons’ of Sapiens, is the key.</p> <p>3. We’re going from “humanists” to “data-ists”</p> <p>In 500 years we might not be dealing with humans at all.</p> <p>Look at Amazon for example. They tell us what to buy. We don’t ask our friends. We ask data.</p> <p>“Given the advances of bioengineering, brain-computer interfaces and so forth, I think it’s very likely that within a century or two homo sapiens will disappear and be replaced by a completely different kind of being,” Yuval said.</p> <p>He says bioengineering is just one possibility. Another is we start connecting brains and computers to create cyborgs.</p> <p>This isn’t science fiction. It’s already happening.</p> <p>I’m sort of scared and sort of excited. We went from tribes to villages to cities to kingdoms to empires to “isms” to…data that will unite us.</p> <p>The next step in our evolution. The final frontier.</p>`
  episode4.pubDate = new Date(1488322800000)
  episode4.podcast = podcast
  episode4.authors = [author1]
  episode4.categories = [category1, category2]
  episode4.isPublic = true
  episode4.isExplicit = true

  let episode5 = new Episode()
  episode5.mediaUrl = assetPath ? `${assetPath}/ferris-1.mp3` : 'http://rss.art19.com/episodes/24f7ada5-64c3-4844-9522-ed6f3c144f1f.mp3'
  episode5.title = 'Stewart Brand - The Polymath of Polymaths'
  episode5.description = `Stewart Brand (@stewartbrand) is the president of The Long Now Foundation, established to foster long-term thinking and responsibility. He leads a project called Revive`
  episode5.pubDate = new Date(1489788000000)
  episode5.podcast = podcast3
  episode5.authors = [author3]
  episode5.categories = [category1, category2]
  episode5.isPublic = true

  let episode6 = new Episode()
  episode6.mediaUrl = assetPath ? `${assetPath}/ferris-2.mp3` : 'https://rss.art19.com/episodes/5016cc2c-3e67-449f-8b53-f06d488e5baf.mp3'
  episode6.title = '#338: Howard Marks — How to Invest with Clear Thinking'
  episode6.description = `<p><strong>Howard Marks</strong> (<a href="https://twitter.com/howardmarksbook" target="_blank">@howardmarksbook</a>) is co-chairman and co-founder of <a href="https://www.oaktreecapital.com/" target="_blank">Oaktree Capital Management</a>, a leading investment firm with more than $120 billion in assets. He is the author of the new book <a href="http://www.amazon.com/exec/obidos/ASIN/1328479250/offsitoftimfe-20" target="_blank"><em>Mastering the Market Cycle: Getting the Odds on Your Side</em></a>, and his previous book on investing, <a href="http://www.amazon.com/exec/obidos/ASIN/B004U5Q1O0/offsitoftimfe-20" target="_blank"><em>The Most Important Thing: Uncommon Sense for the Thoughtful Investor</em></a>, was a critically acclaimed bestseller. Warren Buffett has written of Howard Marks: "When I see memos from Howard Marks in my mail, they're the first thing I open and read. I always learn something." Marks holds a B.S.Ec. degree from the Wharton School of the University of Pennsylvania with a major in finance and an M.B.A. in accounting and marketing from the University of Chicago.</p><p>In this conversation, we discuss:</p><ul><li>How his firm was poised to capitalize on the bubble in 2008 and put massive amounts of capital to work.</li><li>His thoughts on understanding market cycles for making better decisions.</li><li>The three stages of a bull market.</li><li>Newsletters he reads.</li><li>Thoughts on Bitcoin and cryptocurrencies.</li><li>Much, much more...</li></ul><p><br></p><p>Studying what Howard says transcends the world of investing—it's really a study in clearer thinking. I hope you enjoy and learn as much as I did!</p><p><strong>This episode is brought to you by </strong><a href="http://www.inktel.com/tim/" target="_blank"><strong>Inktel</strong></a><strong>. </strong>Ever since I wrote <em>The 4-Hour Workweek</em>, I've been frequently asked about how I choose to delegate tasks. At the root of many of my decisions is a simple question: "How can I invest money to improve my quality of life?" Or "how can I spend moderate money to save significant time?"</p><p><a href="http://www.inktel.com/tim/" target="_blank"><strong>Inktel</strong> </a>is one of those investments. They are a turnkey solution for all of your customer care needs. Their team answers more than 1 million customer service requests each year. They can also interact with your customers across all platforms, including email, phone, social media, text, and chat.</p><p>Inktel removes the logistics and headache of customer communication, allowing you to grow your business by focusing on your strengths. And as a listener of this podcast, you can <strong>get up to $10,000 off your start-up fees and costs waived</strong> by visiting <a href="http://www.inktel.com/tim/" target="_blank"><strong>inktel.com/tim</strong></a><strong>.&nbsp;</strong></p><p><strong>This podcast is also brought to you by </strong><a href="https://helixsleep.com/tim" target="_blank"><strong>Helix Sleep</strong></a><strong>.</strong> I recently moved into a new home and needed new beds, and I purchased mattresses from <a href="https://helixsleep.com/tim" target="_blank">Helix Sleep</a>.</p><p>It offers mattresses personalized to your preferences and sleeping style — without costing thousands of dollars. Visit <a href="https://helixsleep.com/tim" target="_blank"><strong>Helixsleep.com/TIM</strong></a> and take the simple 2-3 minute sleep quiz to get started, and the team there will match you to a mattress you'll love.</p><p>Its customer service makes all the difference. The mattress arrives within a week, and the shipping is completely free. You can try the mattress for 100 nights, and if you're not happy, they'll pick it up and offer a full refund. To personalize your sleep experience, <strong>visit </strong><a href="https://helixsleep.com/tim" target="_blank"><strong>Helixsleep.com/TIM</strong></a><strong> and you'll receive up to $125 off your custom mattress.</strong></p>`
  episode6.pubDate = new Date(1537901136000)
  episode6.podcast = podcast3
  episode6.authors = [author3]
  episode6.categories = [category1, category2]
  episode6.isPublic = true

  let mediaRef = new MediaRef()
  mediaRef.endTime = 934
  mediaRef.startTime = 853
  mediaRef.title = 'Matt Mullenweg, the creator of Wordpress, on the four freedoms of the GPL open source software license'
  mediaRef.authors = [author1]
  mediaRef.categories = [category1, category2]
  mediaRef.episode = episode
  mediaRef.owner = user1
  mediaRef.isPublic = true

  let mediaRef2 = new MediaRef()
  mediaRef2.endTime = 5920
  mediaRef2.startTime = 5566
  mediaRef2.title = 'Effective Altruism and Personal Growth (aka "Finding Yourself")'
  mediaRef2.authors = [author2]
  mediaRef2.categories = [category1, category2]
  mediaRef2.episode = episode2
  mediaRef2.owner = user1
  mediaRef2.isPublic = true

  let mediaRef3 = new MediaRef()
  mediaRef3.endTime = 1145
  mediaRef3.startTime = 977
  mediaRef3.title = 'Adam Grant: "creativity comes from not having the same bag of experience as everyone else"'
  mediaRef3.authors = [author1]
  mediaRef3.categories = [category1, category2]
  mediaRef3.episode = episode3
  mediaRef3.owner = user1
  mediaRef3.isPublic = true

  let mediaRef3b = new MediaRef()
  mediaRef3b.endTime = 1698
  mediaRef3b.startTime = 1521
  mediaRef3b.title = `Why procrastinators tend to be more creative than precrastinators`
  mediaRef3b.authors = [author1]
  mediaRef3b.categories = [category1, category2]
  mediaRef3b.episode = episode3
  mediaRef3b.owner = user1
  mediaRef3b.isPublic = true

  let mediaRef4 = new MediaRef()
  mediaRef4.endTime = 750
  mediaRef4.startTime = 679
  mediaRef4.title = `"Money is probably the most successful story ever told, because it's the only story everybody believes."`
  mediaRef4.authors = [author1]
  mediaRef4.categories = [category1, category2]
  mediaRef4.episode = episode4
  mediaRef4.owner = user1
  mediaRef4.isPublic = true

  let mediaRef5 = new MediaRef()
  mediaRef5.endTime = 6818
  mediaRef5.startTime = 6532
  mediaRef5.title = `"Information wants to be free."`
  mediaRef5.authors = [author3]
  mediaRef5.categories = [category1, category2]
  mediaRef5.episode = episode5
  mediaRef5.owner = user1
  mediaRef5.isPublic = true

  let mediaRef6 = new MediaRef()
  mediaRef6.endTime = 3172
  mediaRef6.startTime = 3035
  mediaRef6.title = `Howard Marks - Balancing Confidence with Uncertainty`
  mediaRef6.authors = [author3]
  mediaRef6.categories = [category1, category2]
  mediaRef6.episode = episode6
  mediaRef6.owner = user1
  mediaRef6.isPublic = true

  let playlist1 = new Playlist()
  playlist1.owner = user1
  playlist1.title = 'Greatest Hits'
  playlist1.itemCount = 3
  playlist1.mediaRefs = [mediaRef2, mediaRef3, mediaRef3b]
  playlist1.description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis rhoncus metus, non commodo elit. Nunc sed felis non lacus vestibulum pharetra vel a erat.'
  playlist1.isPublic = true

  let playlist2 = new Playlist()
  playlist2.owner = user1
  playlist2.title = `Foghorn's Playlist`
  playlist2.itemCount = 4
  playlist2.mediaRefs = [mediaRef4, mediaRef5, mediaRef2, mediaRef3]
  playlist2.description = 'Sed tortor ante, eleifend nec egestas ac, aliquet sed lorem. Duis eget libero consequat, tempor elit nec, sollicitudin arcu.'

  let playlist3 = new Playlist()
  playlist3.owner = user2
  playlist3.title = `Sylvester's Playlist`
  playlist3.itemCount = 5
  playlist3.mediaRefs = [mediaRef, mediaRef6, mediaRef5, mediaRef4, mediaRef3]
  playlist3.description = 'Nam dui justo, fermentum at mauris ac, venenatis rhoncus neque. Aenean porttitor massa odio, id fermentum lectus ante bebendum.'

  let playlist4 = new Playlist()
  playlist4.owner = user3
  playlist4.title = `Tweety's Playlist`
  playlist4.itemCount = 3
  playlist4.mediaRefs = [mediaRef, mediaRef5, mediaRef3]
  playlist4.description = 'Aliquam vehicula, justo in eleifend rhoncus, mi leo gravida nisi, ac laoreet risus augue non lacus. Mauris ut ligula ultrices, accumsan metus finibus, dignissim est.'

  const generateRandomPageVisitData = () => {
    return {
      pastAllTimeTotalUniquePageviews: Math.floor(Math.random() * 1000),
      pastHourTotalUniquePageviews: Math.floor(Math.random() * 1000),
      pastDayTotalUniquePageviews: Math.floor(Math.random() * 1000),
      pastWeekTotalUniquePageviews: Math.floor(Math.random() * 1000),
      pastMonthTotalUniquePageviews: Math.floor(Math.random() * 1000),
      pastYearTotalUniquePageviews: Math.floor(Math.random() * 1000)
    }
  }

  podcast = Object.assign(podcast, generateRandomPageVisitData())
  podcast2 = Object.assign(podcast2, generateRandomPageVisitData())
  podcast3 = Object.assign(podcast3, generateRandomPageVisitData())
  episode = Object.assign(episode, generateRandomPageVisitData())
  episode2 = Object.assign(episode2, generateRandomPageVisitData())
  episode3 = Object.assign(episode3, generateRandomPageVisitData())
  episode4 = Object.assign(episode4, generateRandomPageVisitData())
  episode5 = Object.assign(episode5, generateRandomPageVisitData())
  episode6 = Object.assign(episode6, generateRandomPageVisitData())
  mediaRef = Object.assign(mediaRef, generateRandomPageVisitData())
  mediaRef2 = Object.assign(mediaRef2, generateRandomPageVisitData())
  mediaRef3 = Object.assign(mediaRef3, generateRandomPageVisitData())
  mediaRef3b = Object.assign(mediaRef3b, generateRandomPageVisitData())
  mediaRef4 = Object.assign(mediaRef4, generateRandomPageVisitData())
  mediaRef5 = Object.assign(mediaRef5, generateRandomPageVisitData())
  mediaRef6 = Object.assign(mediaRef6, generateRandomPageVisitData())

  await connection.manager.save([author1, author2, author3, author4, category1, category2, user1, user2, user3, user4, user5, user6, podcast, podcast2, podcast3, episode, episode2, episode3, episode4, episode5, episode6, feedUrl, feedUrl2, feedUrl3])

  await connection.manager.save([mediaRef, mediaRef2, mediaRef3, mediaRef3b, mediaRef4, mediaRef5, mediaRef6])

  await connection.manager.save([playlist1, playlist2, playlist3, playlist4])

  let nestedCategory1 = new Category()
  nestedCategory1.fullPath = 'nested-category-1'
  nestedCategory1.title = 'Nested Category 1'
  nestedCategory1.category = category1

  let nestedCategory2 = new Category()
  nestedCategory2.fullPath = 'nested-category-2'
  nestedCategory2.title = 'Nested Category 2'
  nestedCategory2.category = category2

  await connection.manager.save([nestedCategory1, nestedCategory2])

  let podcast4 = new Podcast()
  podcast4.title = '#WeThePeople LIVE'
  podcast4.imageUrl = assetPath ? `${assetPath}/wethepeople.jpg` : 'http://static.megaphone.fm/podcasts/631704f4-0b52-11e7-b31e-e736e00075b3/image/18343616958_f4243669cd_k.jpg'
  podcast4.description = `In an era of thought bubbles, of talking points, of fake news and phony debate, #WeThePeople LIVE is a refreshing bar-room conversation about the biggest issues of our time. A place to reach across the conversational chasm. Pull up a stool, grab a cocktail, and help make debate healthy again. It's the discussion show for planet earth. Join the conversation: @WTP_Live.`
  podcast4.lastEpisodePubDate = new Date(1455672000000)
  podcast4.lastEpisodeTitle = `EP 137. WE'RE BACK! with SARAH HAIDER`
  podcast4.authors = [author4]
  podcast4.categories = [category1, nestedCategory1]
  podcast4.isPublic = true

  const feedUrl4 = new FeedUrl()
  feedUrl4.podcast = podcast4
  feedUrl4.url = assetPath ? `${assetPath}/wethepeople.rss` : 'http://feeds.megaphone.fm/wethepeoplelive'
  feedUrl4.isAuthority = true

  await connection.manager.save([podcast4, feedUrl4])
}

connectToDb()
  .then(async connection => {
    if (connection) {
      await seedDatabase(connection)
    }
  })
