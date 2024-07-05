export class Google {
  constructor(private opts: { key: string, cx: string } = {
    key: process.env.GOOGLE_SEARCH_KEY as string,
    cx: process.env.GOOGLE_SEARCH_CX as string
  }) {}

  async search(query: string) {
    const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${this.opts.key}&cx=${this.opts.cx}&q=${encodeURIComponent(query)}`)
    return await res.json() as {
      items: {
        title: string
        link: string
        snippet: string
      }[]
    }
  }
}
