import * as WebSocket from 'ws'
import { getFeedUrlByUrl } from '~/controllers/feedUrl'
import { addFeedUrlsByPodcastIndexId } from './queue'

export const runLiveItemListener = () => {
  console.log('starting runLiveItemListener')

  /*
    Run an interval to keep the node script running forever.
    Is there a better way to do this?
  */
  setInterval(() => {
    console.log('runLiveItemListener interval')
  }, 100000000)

  const ws = new WebSocket('wss://api.livewire.io/ws/podping')

  ws.on('message', async function message(data) {
    try {
      const msg = JSON.parse(data)

      if (msg.t === 'podping') {
        for (const p of msg.p) {
          if (p.p.reason === 'live') {
            const podcastIndexIds: string[] = []
            for (const url of p.p.iris) {
              try {
                if (url?.startsWith('http')) {
                  const feedUrl = await getFeedUrlByUrl(url)
                  const { podcastIndexId } = feedUrl.podcast
                  if (podcastIndexId) podcastIndexIds.push(podcastIndexId)
                }
              } catch (err) {
                console.log('p.p.iris error', err)
              }
            }
            const queueType = 'live'
            await addFeedUrlsByPodcastIndexId(podcastIndexIds, queueType)
          }
        }
      }
    } catch (err) {
      console.log('message error:', err)
    }
  })
}
