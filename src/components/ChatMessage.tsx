'use client'

import { format } from 'date-fns'
import { PropertyCardList, type PropertyData } from './PropertyCard'
import { Check, CheckCheck } from 'lucide-react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  isStreaming?: boolean
}

function parseProperties(content: string): {
  text: string
  properties: PropertyData[]
} {
  const propertyRegex = /\[PROPERTIES_START\]([\s\S]*?)\[PROPERTIES_END\]/
  const match = content.match(propertyRegex)

  if (!match) {
    return { text: content, properties: [] }
  }

  const text = content.replace(propertyRegex, '').trim()
  try {
    const properties = JSON.parse(match[1])
    return { text, properties }
  } catch {
    return { text: content, properties: [] }
  }
}

export function ChatMessage({
  role,
  content,
  timestamp,
  isStreaming,
}: ChatMessageProps) {
  const isUser = role === 'user'
  const { text, properties } = parseProperties(content)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`flex items-end gap-2 max-w-[90%] ${isUser ? 'flex-row-reverse' : ''}`}
      >
        {/* Avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-vira-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">V</span>
          </div>
        )}

        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Message bubble */}
          <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-vira'}>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {text}
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse" />
              )}
            </p>
          </div>

          {/* Property cards */}
          {properties.length > 0 && (
            <div className="mt-2 w-full">
              <PropertyCardList properties={properties} />
            </div>
          )}

          {/* Timestamp and read receipt */}
          {timestamp && (
            <div className="flex items-center gap-1 mt-1 px-1">
              <span className="text-[10px] text-gray-400">
                {format(new Date(timestamp), 'h:mm a')}
              </span>
              {isUser && (
                <CheckCheck className="w-3 h-3 text-vira-500" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
