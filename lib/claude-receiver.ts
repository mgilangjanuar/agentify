import { ClaudeStreamResponse } from '@/lib/claude'

export class ClaudeReceiver {
  static async consumeAsText(resp: Response, onData: (data: string) => void, fromBeginning: boolean = false) {
    if (!resp?.body) return
    let result = ''

    const reader = resp.body.getReader()
    const decoder = new TextDecoder()

    let isFinished = false
    while (!isFinished) {
      const { value, done } = await reader.read()
      isFinished = done

      const decoded = decoder.decode(value)
      if (!decoded) break

      for (const line of decoded.split('\r\n\r\n')) {
        if (line.startsWith('text: ')) {
          const text = line.replace(/^text\:\ /, '')
          result += text
          onData(fromBeginning ? result : text)
        }
        if (line.startsWith('__meta: ')) {
          onData(line)
        }
      }
    }
  }

  static async consumeAsData<T = ClaudeStreamResponse>(resp: Response, onData: (data: T | T[]) => void, fromBeginning: boolean = false) {
    if (!resp?.body) return
    const result: T[] = []

    const reader = resp.body.getReader()
    const decoder = new TextDecoder()

    let isFinished = false
    while (!isFinished) {
      const { value, done } = await reader.read()
      isFinished = done

      const decoded = decoder.decode(value)
      if (!decoded) break

      for (const line of decoded.split('\r\n\r\n')) {
        if (line.startsWith('data: ')) {
          const text = line.replace(/^data\:\ /, '')
          const json: T = JSON.parse(text)
          result.push(json)
          onData(fromBeginning ? result : json)
        }
      }
    }
  }
}
