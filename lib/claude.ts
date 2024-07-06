import { cryptr } from '@/lib/crypto'
import { prisma } from '@/lib/db'
import { jsonrepair } from 'jsonrepair'

export interface ClaudeContent {
  type: 'text' | 'image' | 'tool_use' | 'tool_result',
  text?: string,
  source?: {
    type: 'base64',
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
    data: string,
  },
  tool_use_id?: string,
  id?: string,
  name?: string,
  input?: {
    [key: string]: string | any
  },
  is_error?: boolean,
  content?: string | ClaudeContent[]
}

export interface ClaudeCompletionPayload {
  system?: string,
  model?: 'claude-3-haiku-20240307' | 'claude-3-sonnet-20240229' | 'claude-3-opus-20240229' | 'claude-3-5-sonnet-20240620',
  temperature?: number,
  max_tokens?: number,
  messages: {
    role: 'user' | 'assistant',
    content: string | ClaudeContent[]
  }[],
  tools?: {
    name: string,
    description: string,
    input_schema: {
      type: string,
      properties?: {
        [key: string]: {
          type: string,
          description: string,
          [key: string]: any
        }
      },
      required?: string[]
    }
  }[],
  tool_choice?: {
    type: 'auto' | 'any' | 'tool',
    name?: string
  },
  stream?: boolean
}

export interface ClaudeResponse {
  id: string,
  type: string,
  role: 'assistant' | 'user',
  model: string,
  content: ClaudeContent[],
  stop_reason: string,
  stop_sequence: string | null,
  usage: {
    input_tokens: number,
    output_tokens: number
  }
}

export interface ClaudeStreamResponse {
  type: string,
  message?: {
    id: string,
    type: string,
    role: string,
    content: ClaudeContent[],
    model: string,
    stop_reason: string | null,
    stop_sequence: string | null,
    usage: {
      input_tokens?: number,
      output_tokens?: number
    }
  },
  index?: number,
  content_block?: ClaudeContent,
  delta?: {
    type: string,
    text?: string,
    partial_json?: string
  },
  usage?: {
    input_tokens?: number,
    output_tokens?: number
  }
}

export class Claude {
  private abortController: AbortController = new AbortController()
  private payload: ClaudeCompletionPayload | undefined

  constructor(private opts: { apiKey?: string } = { apiKey: process.env.ANTHROPIC_API_KEY }) {
    if (!opts.apiKey) {
      throw new Error('API key is required')
    }
  }

  completion(payload: ClaudeCompletionPayload) {
    this.abortController = new AbortController()
    this.payload = {
      model: 'claude-3-haiku-20240307',
      temperature: 0.05,
      max_tokens: 4096,
      ...payload
    }

    return this
  }

  cancel(): void {
    if (this.abortController) {
      this.abortController.abort()
    }
  }

  async json() {
    if (!this.payload) {
      throw new Error('No payload')
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': this.opts.apiKey || '',
        'anthropic-beta': 'tools-2024-05-16'
      },
      body: JSON.stringify(this.payload as ClaudeCompletionPayload)
    })

    return await resp.json() as ClaudeResponse
  }

  async stream() {
    if (!this.payload) {
      throw new Error('No payload')
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': this.opts.apiKey || '',
        'anthropic-beta': 'tools-2024-05-16'
      },
      body: JSON.stringify({
        ...this.payload,
        stream: true
      } as ClaudeCompletionPayload)
    })

    const meta = {
      usage: {
        input: 0,
        output: 0
      }
    }

    return new ReadableStream<string>({
      async start(controller) {
        if (!resp?.body) return
        const reader = resp.body.getReader()
        const decoder = new TextDecoder()

        let isFinished = false
        while (!isFinished) {
          const { value, done } = await reader.read()
          isFinished = done

          const decoded = decoder.decode(value)
          if (!decoded) break

          try {
            for (const line of decoded.split('\n')) {
              if (!line) continue
              if (!line.startsWith('data: ')) continue
              const json: ClaudeStreamResponse = JSON.parse(
                jsonrepair(
                  line
                    .trim()
                    .replace(/^data\:/gm, '')
                    .trim()
                )
              )
              controller.enqueue(`\n\ndata: ${JSON.stringify(json)}`)
              const text = json.delta?.text || json.delta?.partial_json
              if (text) {
                controller.enqueue(`\n\ntext: ${text}`)
              }

              if (json.message?.usage) {
                meta.usage.input += json.message.usage.input_tokens || 0
                meta.usage.output += json.message.usage.output_tokens || 0
              }
              if (json.usage) {
                meta.usage.input += json.usage.input_tokens || 0
                meta.usage.output += json.usage.output_tokens || 0
              }
            }
          } catch (error) {
            // ignore
          }
        }
        controller.enqueue(`\n\n__meta: ${JSON.stringify(meta)}`)
        controller.close()
      },
    })
  }

  async streamEdge() {
    if (!this.payload) {
      throw new Error('No payload')
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': this.opts.apiKey || '',
        'anthropic-beta': 'tools-2024-05-16'
      },
      body: JSON.stringify({
        ...this.payload,
        stream: true
      } as ClaudeCompletionPayload)
    })

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    let response: string = ''
    let idx = 0
    const meta = {
      usage: {
        input: 0,
        output: 0
      }
    }

    const customReadable = new ReadableStream<Uint8Array>({
      async start(controller) {
        if (!resp?.body) return
        for await (const chunk of resp.body as unknown as AsyncIterable<Uint8Array>) {
          controller.enqueue(chunk)
        }
      },
    })
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const content = decoder.decode(chunk)
        response += content

        const lines = response.split('\n').filter(
          l => l.trim().startsWith('data: ') && l.trim().endsWith('}'))
        for (const line of lines.slice(idx)) {
          try {
            const parsedLine = jsonrepair(
              line.replace(/^data\: /gm, '').trim())
            const json: ClaudeStreamResponse = JSON.parse(parsedLine)

            controller.enqueue(encoder.encode(`\n\ndata: ${JSON.stringify(json)}`))
            const text = json.delta?.text || json.delta?.partial_json
            if (text) {
              controller.enqueue(encoder.encode(`\n\ntext: ${text}`))
            }

            if (json.message?.usage) {
              meta.usage.input += json.message.usage.input_tokens || 0
              meta.usage.output += json.message.usage.output_tokens || 0
            }
            if (json.usage) {
              meta.usage.input += json.usage.input_tokens || 0
              meta.usage.output += json.usage.output_tokens || 0
            }

            if (json.type === 'message_stop') {
              controller.enqueue(
                encoder.encode(`\n\n__meta: ${JSON.stringify(meta)}`)
              )
              controller.terminate()
              return
            }
          } catch (error) {
            // ignore
          }
        }
        idx = lines.length

      },
    })

    return customReadable.pipeThrough(transformStream)
  }
}

export const getAnthropicKey = async (userId: string, minCredits: number = 1) => {
  const user = await prisma.user.findUnique({
    select: {
      configs: true,
      credits: true
    },
    where: {
      id: userId
    }
  })
  if (!user) {
    throw new Error('User not found')
  }
  if (!(user.configs as Record<string, string | undefined | null> | undefined | null)?.['ANTHROPIC_API_KEY']) {
    if (user.credits < minCredits) {
      throw new Error('No credits')
    }
    return undefined
  }
  return cryptr.decrypt((user.configs as Record<string, string>)['ANTHROPIC_API_KEY'])
}
