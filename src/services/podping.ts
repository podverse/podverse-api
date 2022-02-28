import { getFeedUrlByUrl } from '~/controllers/feedUrl'
import { addFeedUrlsByPodcastIndexId } from './queue'
const ws = require('ws')

export const runLiveItemListener = () => {
  console.log('starting runLiveItemListener')

  /*
    Run an interval to keep the node script running forever.
    Is there a better way to do this?
  */
  setInterval(() => {
    console.log('runLiveItemListener interval')
  }, 100000000)

  let openedSocket: boolean | null = null
  const timeInterval = 5000
  const port = 3000
  const url = 'wss://api.livewire.io/ws/podping'

  function connect() {
    const client = new ws(url)
    return new Promise((resolve, reject) => {
      console.log('client try to connect...')

      client.on('open', () => {
        console.log('WEBSOCKET_OPEN: client connected to server at port %s', port)
        openedSocket = true
        resolve(openedSocket)
      })

      client.on('message', async function message(data) {
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

      client.on('close', (err) => {
        console.log('WEBSOCKET_CLOSE: connection closed %o', err)
        openedSocket = false
        reject(err)
      })

      client.on('error', (err) => {
        console.log('WEBSOCKET_ERROR: Error', new Error(err.message))
        openedSocket = false
        reject(err)
      })
    })
  }

  async function reconnect() {
    try {
      await connect()
    } catch (err) {
      console.log('WEBSOCKET_RECONNECT: Error', new Error(err).message)
    }
  }

  reconnect()

  // repeat every 5 seconds
  setInterval(() => {
    if (!openedSocket) {
      reconnect()
    }
  }, timeInterval)
}
