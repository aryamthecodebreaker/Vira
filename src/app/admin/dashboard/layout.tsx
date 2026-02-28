'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_authenticated')
    if (isAuth !== 'true') {
      router.replace('/admin')
    } else {
      setChecking(false)
    }
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-8 h-8 border-2 border-vira-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
