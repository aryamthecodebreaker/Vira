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

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  })

  // Convert messages to Gemini format
  // Gemini requires history to start with a 'user' role message
  // and alternate user/model. We need to filter/fix the order.
  const allMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' as const : 'user' as const,
    content: m.content,
  }))

  // Separate history (all but last) and the current message
  const historyMessages = allMessages.slice(0, -1)
  const lastMessage = allMessages[allMessages.length - 1]

  // Gemini requires: history starts with 'user', alternates user/model
  // Filter out any leading 'model' messages and merge consecutive same-role messages
  const cleanHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
  for (const msg of historyMessages) {
    // Skip leading model messages (Gemini doesn't allow history starting with model)
    if (cleanHistory.length === 0 && msg.role === 'model') {
      continue
    }
    // If same role as previous, merge into previous
    if (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === msg.role) {
      cleanHistory[cleanHistory.length - 1].parts[0].text += '\n' + msg.content
    } else {
      cleanHistory.push({
        role: msg.role,
        parts: [{ text: msg.content }],
      })
    }
  }

  // Gemini also requires history to end with 'model' if it has entries
  // and the last message we send must be 'user'. Trim trailing user from history.
  while (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === 'user') {
    const removed = cleanHistory.pop()!
    // Prepend this to the lastMessage if it's also user
    if (lastMessage.role === 'user') {
      lastMessage.content = removed.parts[0].text + '\n' + lastMessage.content
    }
  }

  const chat = model.startChat({
    history: cleanHistory,
  })

  const result = await chat.sendMessageStream(lastMessage.content)

  return result.stream
}

export { genAI }
