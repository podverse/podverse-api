export const compatParsedChapters = (chapters: any[]) => {
  return chapters.map(chapter => {
    return {
      start_time: chapter.startTime,
      end_time: chapter.endTime || null,
      title: chapter.title || null,
      img: chapter.img || null,
      web_url: chapter.url || null,
      table_of_contents: chapter.toc || true
    }
  })
}
