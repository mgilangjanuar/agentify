import { authorization } from '@/app/api/_middlewares/authorization'
import { AgentifyBrowser } from '@/lib/browser'
import { Claude, ClaudeCompletionPayload, ClaudeContent, getAnthropicKey } from '@/lib/claude'
import { prisma } from '@/lib/db'
import { Google } from '@/lib/google'
import { NextResponse } from 'next/server'

export const POST = authorization(async (req) => {
  const body = await req.json() as {
    useCase: string,
    messages?: ClaudeCompletionPayload['messages']
  }

  if (!body.useCase) {
    return NextResponse.json({
      error: 'Missing useCase'
    }, {
      status: 400
    })
  }

  let apiKey = undefined
  try {
    apiKey = await getAnthropicKey(req.user.id, 2)
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, {
      status: 400
    })
  }

  let messages: ClaudeCompletionPayload['messages'] = body.messages?.length ? body.messages : []
  if (messages[0]?.role !== 'user') {
    messages = [{
      role: 'user',
      content: `The use case: ${body.useCase}`
    }, ...messages]
  }

  const contents: ClaudeContent[] = []

  if (messages.at(-1)?.role === 'assistant') {
    const botContents = messages.at(-1)?.content as ClaudeContent[]
    if (!botContents?.length) {
      return NextResponse.json({
        error: 'Invalid content message'
      }, {
        status: 500
      })
    }

    for (const content of botContents) {
      if (content.type === 'text') {
        console.log(content.content)
      }

      if (content.type === 'tool_use') {
        console.log(`> running: ${content.name}`)

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

        if (content.name === 'generate_tools') {
          return NextResponse.json(messages)
        }
      }
    }

    messages.push({
      role: 'user',
      content: contents
    })
  }

  const resp = await new Claude(apiKey ? { apiKey } : undefined).completion({
    model: 'claude-3-5-sonnet-20240620',
    messages,
    system: `You are a helpful assistant that can generate an autonomous agent.

The final goal is to generate a list of tools that can be used in the autonomous agent with the \`generate_tools\` tool.

Imagine the list of tools as a list of functions that can be used to perform different tasks from the given use case from the user. To make it easier, you should find the Rest API for the tools you want to generate; and use a simple \`fetch\` function form JavaScript to generate the execute property.

Please utilize the provided tools to generate a valid list of tools that can be used by the autonomous agent. Specifically, the input_schema and execute properties must be valid and functional.`,
    tool_choice: {
      type: 'any'
    },
    tools: [
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
      {
        name: 'generate_tools',
        description: 'Generate a list of tools that can be used in the autonomous agent.',
        input_schema: {
          type: 'object',
          properties: {
            agent_name: {
              type: 'string',
              description: 'The name of the autonomous agent.'
            },
            description: {
              type: 'string',
              description: 'The description of the autonomous agent. Eg, what the agent can do, and what instructions it can follow.'
            },
            configs: {
              type: 'array',
              description: 'The list of global configurations or credentials that needed for the tools. Eg, API_KEY, Endpoint, etc.',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'The name of the configuration.'
                  },
                  description: {
                    type: 'string',
                    description: 'The description of the configuration. Include the purpose and how to get it.'
                  }
                },
              }
            },
            tools: {
              type: 'array',
              description: 'The list of tools you want to generate.',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'The name of the tool.'
                  },
                  description: {
                    type: 'string',
                    description: 'The description of the tool.'
                  },
                  input_schema: {
                    type: 'string',
                    description: 'The stringified JSON schema of the input for the tool.'
                  },
                  execute: {
                    type: 'string',
                    description: 'The javascript function that will execute the tool. You can use the built-in function of javascript. It has 2 parameters, input and configs. Eg, `function execute(input, configs) {\n  return fetch(\'https://api.example.com\', {\n    method: \'POST\',\n    body: JSON.stringify(input), \n    headers: { \'Content-Type\': \'application/json\' } \n  }).then(response => response.json())\n}`.'
                  }
                },
                required: ['name', 'description', 'input_schema', 'execute']
              }
            }
          },
          required: ['agent_name', 'description', 'configs', 'tools']
        }
      }
    ]
  }).json()

  if (!resp.content?.length) {
    return NextResponse.json(resp, {
      status: 500
    })
  }

  if (apiKey === undefined) {
    await prisma.user.update({
      where: {
        id: req.user.id
      },
      data: {
        credits: {
          decrement: 2
        }
      }
    })
  }

  messages.push({
    role: 'assistant',
    content: resp.content
  })
  return NextResponse.json(messages)
})
