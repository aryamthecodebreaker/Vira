import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export const VIRA_SYSTEM_PROMPT = `You are Vira, a warm, proactive, and knowledgeable AI real estate assistant. You help users find their dream properties in India.

Your personality:
- Friendly and approachable, like a trusted friend who happens to be a real estate expert
- Proactive: you guide conversations, suggest options, and anticipate needs
- Knowledgeable: you understand Indian real estate market, RERA regulations, property types
- Concise but thorough: give helpful details without overwhelming

Your qualifying flow (ask these naturally, not as a checklist):
1. Budget range (in Lakhs/Crores)
2. Preferred city/area
3. Property type (apartment, villa, plot, commercial)
4. Purpose (investment, self-use, rental income)
5. BHK/size preference
6. Timeline to buy
7. Any specific amenities (gym, pool, school nearby, etc.)

When you have enough info, respond with property suggestions using this EXACT JSON format embedded in your response:
[PROPERTIES_START]
[{"name": "Project Name", "location": "Area, City", "price_range": "₹XX L - ₹XX Cr", "type": "2BHK Apartment", "summary": "Brief 1-2 sentence description", "website": "https://example.com"}]
[PROPERTIES_END]

Important rules:
- Always use ₹ (INR) for prices, use Lakhs (L) and Crores (Cr)
- Sort recommendations by relevance to user preferences
- When refining results, acknowledge what the user wants changed and adjust
- On return visits with known preferences, open with personalized context
- Keep responses conversational and natural, not robotic
- If you don't have specific properties, describe what you'd recommend and their typical price ranges
- Use the property JSON format ONLY when you have enough qualifying info to make recommendations`

export async function streamViraResponse(
  messages: { role: 'user' | 'assistant'; content: string }[],
  userPreferences?: Record<string, unknown> | null
) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }

  let systemPrompt = VIRA_SYSTEM_PROMPT

  if (userPreferences) {
    systemPrompt += `\n\nUser's known preferences from previous conversations:
${JSON.stringify(userPreferences, null, 2)}
Use this context to personalize your responses.`
  }

  // Try primary model, fall back to lite if rate limited
  const modelNames = ['gemini-2.0-flash', 'gemini-1.5-flash']
  let lastError: Error | null = null

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
      })

      // Convert messages to Gemini format
      const allMessages = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' as const : 'user' as const,
        content: m.content,
      }))

      // Separate history and current message
      const historyMessages = allMessages.slice(0, -1)
      const lastMessage = allMessages[allMessages.length - 1]

      // Clean history: must start with 'user', alternate user/model
      const cleanHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
      for (const msg of historyMessages) {
        if (cleanHistory.length === 0 && msg.role === 'model') {
          continue
        }
        if (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === msg.role) {
          cleanHistory[cleanHistory.length - 1].parts[0].text += '\n' + msg.content
        } else {
          cleanHistory.push({
            role: msg.role,
            parts: [{ text: msg.content }],
          })
        }
      }

      // History must end with 'model' if non-empty
      while (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === 'user') {
        const removed = cleanHistory.pop()!
        if (lastMessage.role === 'user') {
          lastMessage.content = removed.parts[0].text + '\n' + lastMessage.content
        }
      }

      const chat = model.startChat({
        history: cleanHistory,
      })

      const result = await chat.sendMessageStream(lastMessage.content)
      return result.stream
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const errMsg = lastError.message || ''
      // If rate limited, try next model
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('Too Many Requests')) {
        console.warn(`Rate limited on ${modelName}, trying fallback...`)
        continue
      }
      // For other errors, throw immediately
      throw lastError
    }
  }

  // If all models failed
  throw lastError || new Error('All Gemini models are currently unavailable')
}

export { genAI }
