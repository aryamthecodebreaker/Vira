import { NextRequest } from 'next/server'
import { streamViraResponse } from '@/lib/claude'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { messages, userPreferences } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const stream = await streamViraResponse(messages, userPreferences)

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text()
            if (text) {
              const data = JSON.stringify({ text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Gemini stream error:', error)
          const errMsg =
            error instanceof Error ? error.message : 'Stream error'
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: errMsg })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    const rawMessage =
      error instanceof Error ? error.message : 'Internal server error'

    // Parse user-friendly error
    let userMessage = rawMessage
    if (rawMessage.includes('429') || rawMessage.includes('quota')) {
      userMessage = 'API rate limit reached. Please wait a minute and try again.'
    } else if (rawMessage.includes('API_KEY')) {
      userMessage = 'API key is not configured. Please contact the administrator.'
    } else if (rawMessage.includes('404') || rawMessage.includes('not found')) {
      userMessage = 'AI model not available. Please try again later.'
    }

    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
