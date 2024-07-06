export class AgentifyBrowser {
  constructor(private opts: { url: string, secret: string } = {
    url: process.env.BROWSER_URL || '',
    secret: process.env.BROWSER_SECRET || ''
  }) {
    if (!opts.url || !opts.secret) {
      throw new Error('Please provide the URL and Secret for the browser.')
    }
  }

  async openUrl(url: string, as?: undefined | 'image' | 'text' | 'markdown') {
    const response = await fetch(this.opts.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.opts.secret}`
      },
      body: JSON.stringify({ url, as })
    })
    if (!response.ok) {
      throw new Error(`Browser failed: ${response.statusText}`)
    }
    if (as === 'text' || as === 'markdown') {
      return await response.text()
    }
    return await response.arrayBuffer()
  }
}
