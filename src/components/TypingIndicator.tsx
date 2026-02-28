'use client'

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-vira-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">V</span>
      </div>
      <div className="chat-bubble-vira">
        <div className="flex items-center gap-1 py-1 px-1">
          <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
