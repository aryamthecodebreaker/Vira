'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Home, MessageCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
  }

  const handleGuestSignIn = async () => {
    const result = await signIn('guest', { redirect: false })
    if (result?.ok) {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vira-50 via-white to-vira-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-vira-600 rounded-2xl mb-4 shadow-lg">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Vira</h1>
          <p className="text-gray-500 mt-2">Your AI Real Estate Assistant</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-vira-600" />
            <p className="text-sm text-gray-600">
              Chat with Vira to find your perfect property
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-400">or</span>
            </div>
          </div>

          {/* Guest Sign In */}
          <button
            onClick={handleGuestSignIn}
            className="w-full bg-vira-600 text-white rounded-xl px-4 py-3 font-medium hover:bg-vira-700 transition-colors shadow-sm"
          >
            Continue as Guest
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            Guest sessions are temporary. Sign in with Google to save your search history.
          </p>
        </div>
      </div>
    </div>
  )
}
