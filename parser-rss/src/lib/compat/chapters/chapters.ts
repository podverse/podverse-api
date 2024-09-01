export const compatParsedChapters = (chapters: any[]) => {
  return chapters.map(chapter => {
    return {
      start_time: chapter.start_time,
      end_time: chapter.end_time || null,
      title: chapter.title || null,
      web_url: chapter.web_url || null,
      table_of_contents: chapter.table_of_contents || true
    }
  })
}
