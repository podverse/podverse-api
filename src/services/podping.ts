import { config } from '~/config'
import { getFeedUrlByUrl } from '~/controllers/feedUrl'
import { logPerformance, _logEnd, _logStart } from '~/lib/utility'
import { addFeedUrlsByPodcastIndexId } from './queue'
const ws = require('ws')
const { dockerCommand } = require('docker-cli-js')

export const pullPodpingImage = async () => {
  const options = {
    machineName: undefined, // uses local docker
    currentWorkingDirectory: '/usr/bin', // uses current working directory
    echo: true, // echo command output to stdout/stderr
    env: undefined,
    stdin: undefined
  }

  await dockerCommand(`pull docker.io/podcastindexorg/podping-hivewriter`, options)
}

export const sendPodpingLiveStatusUpdate = async (validatedUrl: string, status: string) => {
  const options = {
    machineName: undefined, // uses local docker
    currentWorkingDirectory: '/usr/bin', // uses current working directory
    echo: true, // echo command output to stdout/stderr
    env: undefined,
    stdin: undefined
  }

  await dockerCommand(
    `run --rm --storage-driver=vfs -e PODPING_HIVE_ACCOUNT=${config.podping.hiveAccount} -e PODPING_HIVE_POSTING_KEY=${config.podping.hivePostingKey} docker.io/podcastindexorg/podping-hivewriter --ignore-config-updates --no-sanity-check --reason ${status} write ${validatedUrl}`,
    options
  )
}

export const runLiveItemListener = () => {
  logPerformance('starting runLiveItemListener', _logStart)

  /*
    Run an interval to keep the node script running forever.
  */
  setInterval(() => {
    logPerformance('runLiveItemListener interval', _logStart)
  }, 100000000)

  let openedSocket: boolean | null = null
  const timeInterval = 5000
  const url = 'wss://api.livewire.io/ws/podping'

  let connectionId = 0
  const hiveBlocksHandled = {}

  function connect() {
    const client = new ws(url)
    return new Promise((resolve, reject) => {
      logPerformance('client try to connect...', _logStart)

      client.on('open', () => {
        connectionId++
        logPerformance(`WEBSOCKET_OPEN: client connected to server at ${url}, connectionId: ${connectionId}`, _logStart)
        openedSocket = true
        resolve(openedSocket)
      })

      client.on('message', async function message(data) {
        try {
          const msg = JSON.parse(data)

          // If the hiveBlock was already processed by our listener, then skip the message.
          if (hiveBlocksHandled[msg.n]) return

          if (msg.t === 'podping') {
            hiveBlocksHandled[msg.n] = true
            for (const p of msg.p) {
              if (p.p.reason === 'live' || p.p.reason === 'liveEnd') {
                logPerformance(
                  `p.p ${JSON.stringify(p.p)}, p.n Hive block number ${p.n}, connectionId: ${connectionId}`,
                  _logStart
                )
                const podcastIndexIds: string[] = []
                for (const url of p.p.iris) {
                  try {
                    if (url?.startsWith('http')) {
                      let feedUrl = await getFeedUrlByUrl(url)

                      if (!feedUrl) {
                        if (url.startsWith('https:')) {
                          const nextUrl = url.replace('https:', 'http:')
                          feedUrl = await getFeedUrlByUrl(nextUrl)
                        } else if (url.startsWith('http:')) {
                          const nextUrl = url.replace('http:', 'https:')
                          feedUrl = await getFeedUrlByUrl(nextUrl)
                        }
                      }

                      const { podcastIndexId } = feedUrl.podcast
                      if (podcastIndexId) podcastIndexIds.push(podcastIndexId)
                    }
                  } catch (err) {
                    logPerformance(`p.p.iris error ${err}, connectionId: ${connectionId}`, _logStart)
                  }
                }
                const queueType = 'live'
                await addFeedUrlsByPodcastIndexId(podcastIndexIds, queueType)
              }
            }
          }
        } catch (err) {
          logPerformance(`message error: ${err}, connectionId: ${connectionId}`, _logEnd)
        }
      })

      client.on('close', (err) => {
        logPerformance(`WEBSOCKET_CLOSE: connection closed ${err}, connectionId: ${connectionId}`, _logEnd)
        openedSocket = false
        reject(err)
      })

      client.on('error', (err) => {
        logPerformance(`WEBSOCKET_ERROR: Error ${new Error(err.message)}, connectionId: ${connectionId}`, _logEnd)
        openedSocket = false
        reject(err)
      })
    })
  }

  async function reconnect() {
    try {
      await connect()
    } catch (err) {
      logPerformance(`WEBSOCKET_RECONNECT: Error ${new Error(err).message}, connectionId: ${connectionId}`, _logStart)
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
