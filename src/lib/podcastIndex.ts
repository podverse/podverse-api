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
    version: "1.0.0",
    chapters
  }
}
