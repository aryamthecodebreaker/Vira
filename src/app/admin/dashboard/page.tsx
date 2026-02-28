'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'conversations' | 'properties' | 'submissions'

interface Property {
  id: string
  title: string
  type: string
  status: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  listed_date: string
  views: number
  inquiries: number
  owner: string
  owner_phone: string
}

interface Submission {
  id: string
  type: 'partner' | 'owner'
  name: string
  email: string
  phone: string
  company?: string
  license_number?: string
  experience_years?: number
  specialization?: string
  locations?: string[]
  message?: string
  property_type?: string
  property_location?: string
  property_details?: string
  expected_price?: number
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  rejection_reason?: string
}

interface Conversation {
  id: string
  user_name: string
  user_email: string
  messages_count: number
  last_message: string
  last_active: string
  status: 'active' | 'idle' | 'closed'
  topic: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockConversations: Conversation[] = [
  {
    id: 'conv_1',
    user_name: 'Aditya Kumar',
    user_email: 'aditya.k@gmail.com',
    messages_count: 24,
    last_message: 'Can you show me more 2BHK options in Andheri?',
    last_active: '2026-02-28T09:15:00Z',
    status: 'active',
    topic: '2BHK Apartments in Andheri',
  },
  {
    id: 'conv_2',
    user_name: 'Meera Joshi',
    user_email: 'meera.j@outlook.com',
    messages_count: 15,
    last_message: 'What is the price range for villas in Lonavala?',
    last_active: '2026-02-28T08:30:00Z',
    status: 'active',
    topic: 'Villas in Lonavala',
  },
  {
    id: 'conv_3',
    user_name: 'Rohit Menon',
    user_email: 'rohit.menon@yahoo.com',
    messages_count: 8,
    last_message: 'Thanks, I will visit the property this weekend.',
    last_active: '2026-02-27T18:45:00Z',
    status: 'idle',
    topic: '3BHK in Bandra',
  },
  {
    id: 'conv_4',
    user_name: 'Sneha Rao',
    user_email: 'sneha.rao@gmail.com',
    messages_count: 42,
    last_message: 'I have decided to go with the Powai apartment. What are the next steps?',
    last_active: '2026-02-27T16:20:00Z',
    status: 'active',
    topic: 'Apartment Purchase in Powai',
  },
  {
    id: 'conv_5',
    user_name: 'Karan Patel',
    user_email: 'karan.p@gmail.com',
    messages_count: 5,
    last_message: 'Do you have any commercial spaces in BKC?',
    last_active: '2026-02-26T11:00:00Z',
    status: 'idle',
    topic: 'Commercial Space in BKC',
  },
  {
    id: 'conv_6',
    user_name: 'Divya Sharma',
    user_email: 'divya.sharma@gmail.com',
    messages_count: 31,
    last_message: 'The deal is finalized. Thank you for your help!',
    last_active: '2026-02-25T14:30:00Z',
    status: 'closed',
    topic: 'Property Purchase in Worli',
  },
  {
    id: 'conv_7',
    user_name: 'Nikhil Verma',
    user_email: 'nikhil.v@hotmail.com',
    messages_count: 12,
    last_message: 'Can you compare the two properties side by side?',
    last_active: '2026-02-28T07:50:00Z',
    status: 'active',
    topic: 'Property Comparison - Thane',
  },
  {
    id: 'conv_8',
    user_name: 'Pooja Deshmukh',
    user_email: 'pooja.d@gmail.com',
    messages_count: 3,
    last_message: 'Hello, I am looking for rental properties near Hiranandani.',
    last_active: '2026-02-28T10:05:00Z',
    status: 'active',
    topic: 'Rentals in Hiranandani',
  },
]

// ─── Utility Functions ────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)} Cr`
  }
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2)} L`
  }
  return amount.toLocaleString('en-IN')
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

// ─── Icon Components ──────────────────────────────────────────────────────────

function IconLayoutDashboard({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}

function IconChat({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  )
}

function IconBuilding({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  )
}

function IconClipboard({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  )
}

function IconUsers({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

function IconLogout({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  )
}

function IconSearch({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )
}

function IconCheck({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function IconX({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function IconEye({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconTrendingUp({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  )
}

function IconMenu({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}

function IconPlus({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function IconTrash({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function IconPencil({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
}

function IconChevronDown({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [submissionStats, setSubmissionStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)

  // Filters
  const [propertySearch, setPropertySearch] = useState('')
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('all')
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all')
  const [conversationSearch, setConversationSearch] = useState('')
  const [conversationStatusFilter, setConversationStatusFilter] = useState('all')
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState('all')
  const [submissionTypeFilter, setSubmissionTypeFilter] = useState('all')

  // Modal states
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [showSubmissionDetail, setShowSubmissionDetail] = useState<Submission | null>(null)
  const [showRejectModal, setShowRejectModal] = useState<Submission | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [propsRes, subsRes] = await Promise.all([
        fetch('/api/admin/properties'),
        fetch('/api/admin/submissions'),
      ])

      if (propsRes.ok) {
        const propsData = await propsRes.json()
        setProperties(propsData.properties)
      }

      if (subsRes.ok) {
        const subsData = await subsRes.json()
        setSubmissions(subsData.submissions)
        setSubmissionStats(subsData.stats)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleLogout = async () => {
    localStorage.removeItem('admin_authenticated')
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.replace('/admin')
  }

  const handleApproveSubmission = async (id: string) => {
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      })
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, status: 'approved' as const, reviewed_at: new Date().toISOString() }
              : s
          )
        )
        setSubmissionStats((prev) => ({
          ...prev,
          pending: prev.pending - 1,
          approved: prev.approved + 1,
        }))
      }
    } catch (err) {
      console.error('Failed to approve submission:', err)
    }
  }

  const handleRejectSubmission = async () => {
    if (!showRejectModal || !rejectionReason.trim()) return

    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: showRejectModal.id,
          action: 'reject',
          rejection_reason: rejectionReason,
        }),
      })
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === showRejectModal.id
              ? {
                  ...s,
                  status: 'rejected' as const,
                  reviewed_at: new Date().toISOString(),
                  rejection_reason: rejectionReason,
                }
              : s
          )
        )
        setSubmissionStats((prev) => ({
          ...prev,
          pending: prev.pending - 1,
          rejected: prev.rejected + 1,
        }))
        setShowRejectModal(null)
        setRejectionReason('')
      }
    } catch (err) {
      console.error('Failed to reject submission:', err)
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      const res = await fetch(`/api/admin/properties?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (err) {
      console.error('Failed to delete property:', err)
    }
  }

  // ─── Filter Data ──────────────────────────────────────────────────────────

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      !propertySearch ||
      p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.location.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.owner.toLowerCase().includes(propertySearch.toLowerCase())
    const matchesStatus = propertyStatusFilter === 'all' || p.status === propertyStatusFilter
    const matchesType = propertyTypeFilter === 'all' || p.type === propertyTypeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredConversations = mockConversations.filter((c) => {
    const matchesSearch =
      !conversationSearch ||
      c.user_name.toLowerCase().includes(conversationSearch.toLowerCase()) ||
      c.user_email.toLowerCase().includes(conversationSearch.toLowerCase()) ||
      c.topic.toLowerCase().includes(conversationSearch.toLowerCase())
    const matchesStatus = conversationStatusFilter === 'all' || c.status === conversationStatusFilter
    return matchesSearch && matchesStatus
  })

  const filteredSubmissions = submissions.filter((s) => {
    const matchesStatus = submissionStatusFilter === 'all' || s.status === submissionStatusFilter
    const matchesType = submissionTypeFilter === 'all' || s.type === submissionTypeFilter
    return matchesStatus && matchesType
  })

  // ─── Sidebar Navigation ──────────────────────────────────────────────────

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <IconLayoutDashboard /> },
    { id: 'conversations', label: 'Conversations', icon: <IconChat /> },
    { id: 'properties', label: 'Properties', icon: <IconBuilding /> },
    { id: 'submissions', label: 'Submissions', icon: <IconClipboard /> },
  ]

  // ─── Status Badge Component ───────────────────────────────────────────────

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
      idle: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          styles[status] || styles.inactive
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  // ─── Overview Tab ─────────────────────────────────────────────────────────

  const renderOverview = () => {
    const stats = [
      {
        label: 'Total Users',
        value: '1,247',
        change: '+12.5%',
        icon: <IconUsers className="w-6 h-6" />,
        color: 'from-blue-500 to-blue-600',
      },
      {
        label: 'Conversations',
        value: '3,842',
        change: '+8.2%',
        icon: <IconChat className="w-6 h-6" />,
        color: 'from-purple-500 to-purple-600',
      },
      {
        label: 'Properties',
        value: String(properties.length),
        change: '+3.1%',
        icon: <IconBuilding className="w-6 h-6" />,
        color: 'from-emerald-500 to-emerald-600',
      },
      {
        label: 'Pending Submissions',
        value: String(submissionStats.pending),
        change: 'Needs review',
        icon: <IconClipboard className="w-6 h-6" />,
        color: 'from-amber-500 to-amber-600',
      },
    ]

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <IconTrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Conversations */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Conversations</h3>
              <button
                onClick={() => setActiveTab('conversations')}
                className="text-sm text-vira-400 hover:text-vira-300 transition-colors"
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {mockConversations.slice(0, 5).map((conv) => (
                <div key={conv.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-750 hover:bg-gray-700/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-300">
                      {conv.user_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{conv.user_name}</p>
                      <StatusBadge status={conv.status} />
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{conv.last_message}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {timeAgo(conv.last_active)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Submissions</h3>
              <button
                onClick={() => setActiveTab('submissions')}
                className="text-sm text-vira-400 hover:text-vira-300 transition-colors"
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {submissions.slice(0, 5).map((sub) => (
                <div key={sub.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      sub.type === 'partner' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    <span className="text-xs font-bold">
                      {sub.type === 'partner' ? 'P' : 'O'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{sub.name}</p>
                      <StatusBadge status={sub.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {sub.type === 'partner' ? sub.company : sub.property_location} &middot;{' '}
                      {sub.type === 'partner' ? 'Partner Application' : 'Property Listing'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatDate(sub.submitted_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Conversations Tab ────────────────────────────────────────────────────

  const renderConversations = () => {
    return (
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or topic..."
              value={conversationSearch}
              onChange={(e) => setConversationSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <select
              value={conversationStatusFilter}
              onChange={(e) => setConversationStatusFilter(e.target.value)}
              className="appearance-none w-full sm:w-40 pl-4 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="closed">Closed</option>
            </select>
            <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    User
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Topic
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Messages
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Last Active
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredConversations.map((conv) => (
                  <tr key={conv.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-300">
                            {conv.user_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{conv.user_name}</p>
                          <p className="text-xs text-gray-400">{conv.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-300">{conv.topic}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-300">{conv.messages_count}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-400">{timeAgo(conv.last_active)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={conv.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                        <IconEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredConversations.length === 0 && (
            <div className="text-center py-12">
              <IconChat className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No conversations found</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Properties Tab ───────────────────────────────────────────────────────

  const renderProperties = () => {
    return (
      <div className="space-y-4">
        {/* Search, Filters, and Add Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={propertyStatusFilter}
                onChange={(e) => setPropertyStatusFilter(e.target.value)}
                className="appearance-none w-full sm:w-36 pl-4 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={propertyTypeFilter}
                onChange={(e) => setPropertyTypeFilter(e.target.value)}
                className="appearance-none w-full sm:w-36 pl-4 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Commercial">Commercial</option>
                <option value="Row House">Row House</option>
              </select>
              <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={() => {
                setEditingProperty(null)
                setShowPropertyModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-vira-600 hover:bg-vira-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <IconPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Property</span>
            </button>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Property
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Type
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Price
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Views
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Inquiries
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Listed
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">{prop.title}</p>
                        <p className="text-xs text-gray-400">{prop.location}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-300">{prop.type}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-white">
                        {formatCurrency(prop.price)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-300">{prop.views}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-300">{prop.inquiries}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={prop.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-400">{formatDate(prop.listed_date)}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingProperty(prop)
                            setShowPropertyModal(true)
                          }}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <IconPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(prop.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <IconBuilding className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No properties found</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Submissions Tab ──────────────────────────────────────────────────────

  const renderSubmissions = () => {
    return (
      <div className="space-y-4">
        {/* Submission Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: submissionStats.total, color: 'text-white' },
            { label: 'Pending', value: submissionStats.pending, color: 'text-amber-400' },
            { label: 'Approved', value: submissionStats.approved, color: 'text-emerald-400' },
            { label: 'Rejected', value: submissionStats.rejected, color: 'text-red-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <select
              value={submissionStatusFilter}
              onChange={(e) => setSubmissionStatusFilter(e.target.value)}
              className="appearance-none w-full pl-4 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative flex-1">
            <select
              value={submissionTypeFilter}
              onChange={(e) => setSubmissionTypeFilter(e.target.value)}
              className="appearance-none w-full pl-4 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="partner">Partner Applications</option>
              <option value="owner">Owner Listings</option>
            </select>
            <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Submissions Cards */}
        <div className="space-y-3">
          {filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Left - Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        sub.type === 'partner'
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {sub.type === 'partner' ? 'Partner' : 'Owner'}
                    </span>
                    <StatusBadge status={sub.status} />
                    <span className="text-xs text-gray-500">
                      {formatDateTime(sub.submitted_at)}
                    </span>
                  </div>

                  <h4 className="text-white font-medium mt-2">{sub.name}</h4>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {sub.email} &middot; {sub.phone}
                  </p>

                  {sub.type === 'partner' && (
                    <div className="mt-2 text-sm text-gray-300">
                      <p>
                        <span className="text-gray-500">Company:</span> {sub.company}
                      </p>
                      <p>
                        <span className="text-gray-500">Experience:</span>{' '}
                        {sub.experience_years} years &middot; {sub.specialization}
                      </p>
                      <p>
                        <span className="text-gray-500">Areas:</span>{' '}
                        {sub.locations?.join(', ')}
                      </p>
                    </div>
                  )}

                  {sub.type === 'owner' && (
                    <div className="mt-2 text-sm text-gray-300">
                      <p>
                        <span className="text-gray-500">Property:</span> {sub.property_type} in{' '}
                        {sub.property_location}
                      </p>
                      <p>
                        <span className="text-gray-500">Details:</span> {sub.property_details}
                      </p>
                      {sub.expected_price && (
                        <p>
                          <span className="text-gray-500">Expected Price:</span>{' '}
                          {formatCurrency(sub.expected_price)}
                        </p>
                      )}
                    </div>
                  )}

                  {sub.message && (
                    <p className="mt-2 text-sm text-gray-400 italic">
                      &ldquo;{sub.message}&rdquo;
                    </p>
                  )}

                  {sub.rejection_reason && (
                    <div className="mt-2 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                      <p className="text-sm text-red-400">
                        <span className="font-medium">Rejection reason:</span>{' '}
                        {sub.rejection_reason}
                      </p>
                    </div>
                  )}

                  {sub.reviewed_at && (
                    <p className="mt-2 text-xs text-gray-500">
                      Reviewed on {formatDateTime(sub.reviewed_at)}
                    </p>
                  )}
                </div>

                {/* Right - Actions */}
                {sub.status === 'pending' && (
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApproveSubmission(sub.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <IconCheck className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal(sub)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <IconX className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
              <IconClipboard className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No submissions found</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Property Modal ───────────────────────────────────────────────────────

  const renderPropertyModal = () => {
    if (!showPropertyModal) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              {editingProperty ? 'Edit Property' : 'Add Property'}
            </h3>
            <button
              onClick={() => {
                setShowPropertyModal(false)
                setEditingProperty(null)
              }}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              // In a real app, this would call the API
              setShowPropertyModal(false)
              setEditingProperty(null)
            }}
            className="p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
              <input
                type="text"
                defaultValue={editingProperty?.title || ''}
                placeholder="e.g., 3 BHK Apartment in Bandra"
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Type</label>
                <select
                  defaultValue={editingProperty?.type || 'Apartment'}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Row House">Row House</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
                <select
                  defaultValue={editingProperty?.status || 'active'}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
              <input
                type="text"
                defaultValue={editingProperty?.location || ''}
                placeholder="e.g., Bandra West, Mumbai"
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Price (INR)</label>
              <input
                type="number"
                defaultValue={editingProperty?.price || ''}
                placeholder="e.g., 25000000"
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Bedrooms</label>
                <input
                  type="number"
                  defaultValue={editingProperty?.bedrooms ?? 0}
                  min={0}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Bathrooms</label>
                <input
                  type="number"
                  defaultValue={editingProperty?.bathrooms ?? 0}
                  min={0}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Area (sqft)</label>
                <input
                  type="number"
                  defaultValue={editingProperty?.area ?? 0}
                  min={0}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Owner Name</label>
              <input
                type="text"
                defaultValue={editingProperty?.owner || ''}
                placeholder="Property owner name"
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Owner Phone</label>
              <input
                type="text"
                defaultValue={editingProperty?.owner_phone || ''}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-vira-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPropertyModal(false)
                  setEditingProperty(null)
                }}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-vira-600 hover:bg-vira-700 text-white font-medium rounded-xl transition-colors text-sm"
              >
                {editingProperty ? 'Save Changes' : 'Add Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ─── Reject Modal ─────────────────────────────────────────────────────────

  const renderRejectModal = () => {
    if (!showRejectModal) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Reject Submission</h3>
            <button
              onClick={() => {
                setShowRejectModal(null)
                setRejectionReason('')
              }}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-300 mb-3">
              Rejecting submission from <strong className="text-white">{showRejectModal.name}</strong>
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Reason for rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={4}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(null)
                  setRejectionReason('')
                }}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmission}
                disabled={!rejectionReason.trim()}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Main Render ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-vira-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm mt-3">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-800 border-r border-gray-700 flex flex-col transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700">
          <div className="w-9 h-9 bg-vira-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div>
            <h2 className="text-white font-semibold">Vira Admin</h2>
            <p className="text-xs text-gray-400">Dashboard</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-vira-600/10 text-vira-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {item.icon}
              {item.label}
              {item.id === 'submissions' && submissionStats.pending > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {submissionStats.pending}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <IconLogout />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <IconMenu />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {navItems.find((n) => n.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-gray-400">
                {activeTab === 'overview' && 'Welcome back. Here is your platform overview.'}
                {activeTab === 'conversations' && `${mockConversations.length} total conversations`}
                {activeTab === 'properties' && `${properties.length} total properties`}
                {activeTab === 'submissions' && `${submissionStats.total} total submissions`}
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'conversations' && renderConversations()}
          {activeTab === 'properties' && renderProperties()}
          {activeTab === 'submissions' && renderSubmissions()}
        </div>
      </main>

      {/* Modals */}
      {renderPropertyModal()}
      {renderRejectModal()}
    </div>
  )
}
