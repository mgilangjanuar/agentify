import { authorization, ReqWithUser } from '@/app/api/_middlewares/authorization'
import { AgentifyBrowser } from '@/lib/browser'
import { Claude, ClaudeCompletionPayload, ClaudeContent, getAnthropicKey } from '@/lib/claude'
import { cryptr } from '@/lib/crypto'
import { prisma } from '@/lib/db'
import { Google } from '@/lib/google'
import { AgentifyScript } from '@/lib/script'
import { Agent, InstalledAgent } from '@prisma/client'
import { jsonrepair } from 'jsonrepair'
import { NextResponse } from 'next/server'

export const POST = authorization(async (req: ReqWithUser) => {
  const body = await req.json() as {
    messages: ClaudeCompletionPayload['messages'],
    installedAgentId?: string,
  }

  if (!body.messages?.length) {
    return NextResponse.json({
      error: 'Messages are required'
    }, {
      status: 400
    })
  }

  let apiKey = undefined
  try {
    apiKey = await getAnthropicKey(req.user.id, 1)
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, {
      status: 400
    })
  }

  let agent: (InstalledAgent & { agent: Agent }) | null = null
  if (body.installedAgentId) {
    agent = await prisma.installedAgent.findUnique({
      where: {
        id: body.installedAgentId
      },
      include: {
        agent: true
      }
    })
    if (!agent) {
      return NextResponse.json({
        error: 'Installed agent not found'
      }, {
        status: 404
      })
    }
    agent.configs = Object.keys(agent.configs || {}).reduce((acc, key) => {
      acc[key] = cryptr.decrypt((agent!.configs as Record<string, string>)[key])
      return acc
    }, {} as Record<string, string>)
  }

  let done = false
  while (!done) {
    if (body.messages.at(-1)?.role !== 'user') {
      done = true
      break
    }

    const resp = await new Claude(apiKey ? { apiKey } : undefined).completion({
      model: 'claude-3-5-sonnet-20240620',
      messages: body.messages,
      system: agent ? `You are an autonomous agent that can perform tasks based on the use case.

Agent name: ${agent.agent.name}

Agent description: ${agent.agent.description}${agent.agent.system ? `

Follow the additional instructions:
${agent.agent.system}` : ''}` : undefined,
      tool_choice: agent?.agent.isUsingBrowsing || agent?.agent.tools ? {
        type: 'auto'
      } : undefined,
      tools: [
        ...agent?.agent.isUsingBrowsing ? [
          {
            name: 'search',
            description: 'Search for the information you need through a search engine.',
            input_schema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query you want to search for.'
                }
              },
              required: ['query']
            }
          },
          {
            name: 'open_url',
            description: 'Open a URL in a browser and return the result as text, image, or markdown.',
            input_schema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The valid URL you want to open.'
                },
                resultType: {
                  type: 'string',
                  description: 'The type of the search result you want to get. Possible value: `text`, `image`, or `markdown`.',
                  enum: ['text', 'image', 'markdown']
                }
              },
              required: ['url', 'resultType']
            }
          },
        ] : [],
        ...(agent?.agent.tools as { name: string, description: string, input_schema: string }[] || []).map(tool => ({
          name: tool.name,
          description: tool.description,
          input_schema: JSON.parse(jsonrepair(tool.input_schema))
        })),
      ]
    }).json()

    if (!resp.content?.length) {
      return NextResponse.json(resp, {
        status: 500
      })
    }

    body.messages.push({
      role: 'assistant',
      content: resp.content
    })

    const contents: ClaudeContent[] = []

    for (const content of resp.content) {
      if (content.type === 'tool_use' && agent) {
        console.log(`> running: ${content.name}`)

        const tool = (agent?.agent.tools as {
          name: string,
          description: string,
          input_schema: string,
          execute: string
        }[] || []).find((tool: any) => tool.name === content.name)
        if (tool) {
          const input = content.input
          try {
            const output = await new AgentifyScript().run(tool.execute, [input, agent.configs])
            // const output = await eval(`(${tool.execute})`)(input, agent.configs)
            console.log(`> running \`${content.name}\` successfully...`)
            contents.push({
              type: 'tool_result',
              tool_use_id: content.id,
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(output)
                }
              ]
            })
          } catch (error: any) {
            console.error(error)
            contents.push({
              type: 'tool_result',
              tool_use_id: content.id,
              is_error: true,
              content: [
                {
                  type: 'text',
                  text: error.message
                }
              ]
            })
          }
        }

        if (agent.agent.isUsingBrowsing) {
          if (content.name === 'search') {
            const query = content.input?.query
            const searchResults = await new Google().search(query)
            console.log(`> search results (\`${query}\`): ${searchResults.items.length} items`)
            contents.push({
              type: 'tool_result',
              tool_use_id: content.id,
              content: [
                {
                  type: 'text', text: JSON.stringify(searchResults)
                }
              ]
            })
          }

          if (content.name === 'open_url') {
            const url = content.input?.url
            const resultType = content.input?.resultType as 'text' | 'image' | 'markdown'
            const resp = await new AgentifyBrowser().openUrl(url, resultType)
            console.log(`> open url (${url}): ${resultType}`)
            if (resultType === 'image') {
              const screenshot = resp as ArrayBuffer
              if (screenshot.byteLength > 4_032_984) {
                contents.push({
                  type: 'tool_result',
                  tool_use_id: content.id,
                  is_error: true,
                  content: [
                    {
                      type: 'text',
                      text: 'The image is too large. Please use the `text` or `markdown` resultType.'
                    }
                  ]
                })
              } else {
                contents.push({
                  type: 'tool_result',
                  tool_use_id: content.id,
                  content: [
                    {
                      type: 'image',
                      source: {
                        type: 'base64',
                        media_type: 'image/jpeg',
                        data: Buffer.from(screenshot).toString('base64')
                      }
                    }
                  ]
                })
              }
            } else {
              contents.push({
                type: 'tool_result',
                tool_use_id: content.id,
                content: [
                  {
                    type: 'text',
                    text: resp?.slice(0, 50_000) as string
                  }
                ]
              })
            }
          }
        }

      }
    }

    if (contents.length) {
      body.messages.push({
        role: 'user',
        content: contents
      })
    }
  }

  if (apiKey === undefined) {
    await prisma.user.update({
      where: {
        id: req.user.id
      },
      data: {
        credits: {
          decrement: 1
        }
      }
    })
  }

  return NextResponse.json({
    messages: body.messages
   })
})
