import { getFeedUrlByUrl } from '~/controllers/feedUrl'
import { logPerformance, _logEnd, _logStart } from '~/lib/utility'
import { addFeedUrlsByPodcastIndexId } from './queue'
const ws = require('ws')

export const runLiveItemListener = () => {
  logPerformance('starting runLiveItemListener', _logStart)

  /*
    Run an interval to keep the node script running forever.
    Is there a better way to do this?
  */
  setInterval(() => {
    logPerformance('runLiveItemListener interval', _logStart)
  }, 100000000)

  let openedSocket: boolean | null = null
  const timeInterval = 5000
  const url = 'wss://api.livewire.io/ws/podping'

  function connect() {
    const client = new ws(url)
    return new Promise((resolve, reject) => {
      logPerformance('client try to connect...', _logStart)

      client.on('open', () => {
        logPerformance(`WEBSOCKET_OPEN: client connected to server at ${url}`, _logStart)
        openedSocket = true
        resolve(openedSocket)
      })

      client.on('message', async function message(data) {
        try {
          const msg = JSON.parse(data)
          if (msg.t === 'podping') {
            for (const p of msg.p) {
              if (p.p.reason === 'live' || p.p.reason === 'liveEnd') {
                logPerformance(`p.p ${p.p}`, _logStart)
                const podcastIndexIds: string[] = []
                for (const url of p.p.iris) {
                  try {
                    if (url?.startsWith('http')) {
                      const feedUrl = await getFeedUrlByUrl(url)
                      const { podcastIndexId } = feedUrl.podcast
                      if (podcastIndexId) podcastIndexIds.push(podcastIndexId)
                    }
                  } catch (err) {
                    logPerformance(`p.p.iris error ${err}`, _logStart)
                  }
                }
                const queueType = 'live'
                await addFeedUrlsByPodcastIndexId(podcastIndexIds, queueType)
              }
            }
          }
        } catch (err) {
          logPerformance(`message error: ${err}`, _logEnd)
        }
      })

      client.on('close', (err) => {
        logPerformance(`WEBSOCKET_CLOSE: connection closed ${err}`, _logEnd)
        openedSocket = false
        reject(err)
      })

      client.on('error', (err) => {
        logPerformance(`WEBSOCKET_ERROR: Error ${new Error(err.message)}`, _logEnd)
        openedSocket = false
        reject(err)
      })
    })
  }

  async function reconnect() {
    try {
      await connect()
    } catch (err) {
      logPerformance(`WEBSOCKET_RECONNECT: Error ${new Error(err).message}`, _logStart)
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
