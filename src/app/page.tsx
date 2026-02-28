'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ChatInterface } from '@/components/ChatInterface'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-vira-600 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return <ChatInterface />
}
