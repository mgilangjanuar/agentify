export class AgentifyScript {
  constructor(private opts: { url: string, secret: string } = {
    url: process.env.SCRIPT_URL || '',
    secret: process.env.SCRIPT_SECRET || ''
  }) {
    if (!opts.url || !opts.secret) {
      throw new Error('Please provide the URL and Secret for the script.')
    }
  }

  async run(script: string, args: unknown[] = []) {
    const response = await fetch(this.opts.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.opts.secret}`
      },
      body: JSON.stringify({ script, args })
    })
    if (!response.ok) {
      throw new Error(`Script failed: ${response.statusText}`)
    }
    const json = await response.json()
    return json.result as unknown
  }
}
