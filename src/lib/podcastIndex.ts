export const convertToChaptersFile = (mediaRefs) => {
  const chapters = [] as any

  for (const mediaRef of mediaRefs) {
    const { endTime, startTime, title } = mediaRef
    const chapter = {
      ...(endTime ? { endTime } : {}),
      startTime,
      ...(title ? { title } : {})
    }

    chapters.push(chapter)
  }

  return {
    version: '1.0.0',
    chapters
  }
}

type PIValueModel = {
  type: string
  method: string
  suggested: string
}

type PIValueDestination = {
  name: string
  type: string
  address: string
  split: number
  customKey?: string
  customValue?: string
  fee?: boolean
}

type PIValueTag = {
  model: PIValueModel
  destinations: PIValueDestination[]
}

export const convertPIValueTagToPVValueTagArray = (piValueTag: PIValueTag) => {
  return [
    {
      method: piValueTag.model.method,
      suggested: piValueTag.model.suggested,
      type: piValueTag.model.type,
      recipients: piValueTag.destinations.map((destination: PIValueDestination) => {
        return {
          address: destination.address,
          customKey: destination.customKey || '',
          customValue: destination.customValue || '',
          fee: destination.fee || false,
          name: destination.name || '',
          split: destination.split || 0,
          type: destination.type || ''
        }
      })
    }
  ] as any[]
}
