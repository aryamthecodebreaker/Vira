'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  ArrowLeft,
  Upload,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Home,
  IndianRupee,
  Image,
  Ruler,
  Calendar,
  Scale,
  Building,
  ChevronRight,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  widget?: 'file-upload' | 'options' | 'summary'
  options?: string[]
  files?: string[]
  summaryData?: Record<string, string | string[]>
}

interface OwnerData {
  ownerName: string
  contactEmail: string
  contactPhone: string
  propertyAddress: string
  propertyType: string
  size: string
  floors: string
  ageOfProperty: string
  askingPrice: string
  negotiable: string
  photos: string[]
  currentStatus: string
  legalStatus: string
}

/* ------------------------------------------------------------------ */
/*  Steps definition                                                   */
/* ------------------------------------------------------------------ */

interface Step {
  key: keyof OwnerData
  question: string
  widget?: 'file-upload' | 'options'
  options?: string[]
  multi?: boolean
  validate?: (v: string) => string | null
}

const STEPS: Step[] = [
  {
    key: 'ownerName',
    question:
      "Hi there! I'm Vira, and I'll walk you through listing your property on our platform. It's quick and easy!\n\nLet's start with your full name.",
  },
  {
    key: 'contactEmail',
    question: "Nice to meet you, {ownerName}! What's your email address?",
    validate: (v: string) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address.'
      return null
    },
  },
  {
    key: 'contactPhone',
    question: "And your phone number? (Include country code, e.g. +91 98765 43210)",
    validate: (v: string) => {
      if (!/^\+?\d[\d\s\-]{7,}$/.test(v)) return 'Please enter a valid phone number.'
      return null
    },
  },
  {
    key: 'propertyAddress',
    question: "Now let's talk about your property. What's the complete address?",
  },
  {
    key: 'propertyType',
    question: "What type of property is this?",
    widget: 'options',
    options: ['Resale Flat', 'Independent House', 'Plot', 'Commercial Space', 'Villa', 'Builder Floor'],
  },
  {
    key: 'size',
    question: "What is the size of the property? (e.g. 1200 sq ft, 200 sq yards)",
  },
  {
    key: 'floors',
    question: "How many floors does the property have? (or which floor is it on, if it's a flat)",
  },
  {
    key: 'ageOfProperty',
    question: "How old is the property? (e.g. New, 2 years, 10 years, Under Construction)",
  },
  {
    key: 'askingPrice',
    question: "What is your asking price? (e.g. 45 Lakhs, 1.5 Cr)",
  },
  {
    key: 'negotiable',
    question: "Is the price negotiable?",
    widget: 'options',
    options: ['Yes, negotiable', 'Slightly negotiable', 'Fixed price'],
  },
  {
    key: 'photos',
    question: "Please upload some photos of your property. You can add multiple images.",
    widget: 'file-upload',
  },
  {
    key: 'currentStatus',
    question: "What is the current status of the property?",
    widget: 'options',
    options: ['Ready to Move', 'Under Construction', 'Partially Furnished', 'Fully Furnished', 'Needs Renovation'],
  },
  {
    key: 'legalStatus',
    question: "What is the legal status of the property?",
    widget: 'options',
    options: ['Clear Title', 'Loan on Property', 'Under Dispute', 'Society Transfer Pending', 'RERA Registered'],
  },
]

const TOTAL_STEPS = STEPS.length

/* ------------------------------------------------------------------ */
/*  Helper to produce summary labels                                   */
/* ------------------------------------------------------------------ */

function labelFor(key: string): string {
  const map: Record<string, string> = {
    ownerName: 'Owner Name',
    contactEmail: 'Email',
    contactPhone: 'Phone',
    propertyAddress: 'Address',
    propertyType: 'Property Type',
    size: 'Size',
    floors: 'Floors',
    ageOfProperty: 'Age of Property',
    askingPrice: 'Asking Price',
    negotiable: 'Negotiable',
    photos: 'Photos',
    currentStatus: 'Current Status',
    legalStatus: 'Legal Status',
  }
  return map[key] || key
}

/* ------------------------------------------------------------------ */
/*  Bubble sub-components                                              */
/* ------------------------------------------------------------------ */

function ViraAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-vira-600 flex items-center justify-center flex-shrink-0">
      <span className="text-white text-xs font-bold">V</span>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <ViraAvatar />
      <div className="chat-bubble-vira">
        <div className="flex items-center gap-1 py-1 px-1">
          <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
          <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
          <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function OwnerPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [stepIdx, setStepIdx] = useState(0)
  const [data, setData] = useState<OwnerData>({
    ownerName: '',
    contactEmail: '',
    contactPhone: '',
    propertyAddress: '',
    propertyType: '',
    size: '',
    floors: '',
    ageOfProperty: '',
    askingPrice: '',
    negotiable: '',
    photos: [],
    currentStatus: '',
    legalStatus: '',
  })
  const [multiSelect, setMultiSelect] = useState<string[]>([])
  const [mockFiles, setMockFiles] = useState<string[]>([])
  const [typing, setTyping] = useState(false)
  const [done, setDone] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ---- scroll helper ---- */
  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, typing, scrollToBottom])

  /* ---- kick off first question ---- */
  useEffect(() => {
    pushViraMessage(STEPS[0].question, STEPS[0].widget, STEPS[0].options)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---- push a vira message with simulated typing delay ---- */
  function pushViraMessage(
    text: string,
    widget?: 'file-upload' | 'options',
    options?: string[],
    summaryData?: Record<string, string | string[]>
  ) {
    setTyping(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `vira_${Date.now()}`,
          role: 'assistant',
          content: text,
          timestamp: new Date().toISOString(),
          widget: summaryData ? 'summary' : widget,
          options,
          summaryData,
        },
      ])
      setTyping(false)
    }, 600)
  }

  /* ---- push a user message ---- */
  function pushUserMessage(text: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: `user_${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      },
    ])
  }

  /* ---- advance to next step ---- */
  function advance(value: string | string[]) {
    const step = STEPS[stepIdx]

    // update data
    setData((prev) => ({ ...prev, [step.key]: value }))

    const next = stepIdx + 1
    if (next < TOTAL_STEPS) {
      setStepIdx(next)
      const nextStep = STEPS[next]
      // interpolate with updated data
      const updatedData: Record<string, unknown> = { ...data, [step.key]: value }
      const qText = nextStep.question.replace(/\{(\w+)\}/g, (_, key) => {
        const v = updatedData[key]
        if (Array.isArray(v)) return v.join(', ')
        return String(v || '')
      })
      pushViraMessage(qText, nextStep.widget, nextStep.options)
    } else {
      // build summary
      const updatedData: Record<string, unknown> = { ...data, [step.key]: value }
      const summary: Record<string, string | string[]> = {}
      for (const s of STEPS) {
        const v = updatedData[s.key]
        if (Array.isArray(v)) summary[s.key] = v as string[]
        else summary[s.key] = String(v || '-')
      }
      pushViraMessage(
        "Here's a summary of your property listing. Please review everything and click **Submit for Review** when you're happy with it.",
        undefined,
        undefined,
        summary
      )
      setDone(true)
    }
  }

  /* ---- handle text submit ---- */
  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || typing || done) return

    const step = STEPS[stepIdx]

    // validate
    if (step.validate) {
      const err = step.validate(trimmed)
      if (err) {
        pushUserMessage(trimmed)
        setInput('')
        pushViraMessage(err + '\n\nPlease try again.')
        return
      }
    }

    pushUserMessage(trimmed)
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'

    advance(trimmed)
  }

  /* ---- handle option select ---- */
  function handleOptionSelect(option: string) {
    const step = STEPS[stepIdx]
    if (step.multi) {
      setMultiSelect((prev) =>
        prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
      )
    } else {
      pushUserMessage(option)
      advance(option)
    }
  }

  function handleMultiConfirm() {
    if (multiSelect.length === 0) return
    pushUserMessage(multiSelect.join(', '))
    advance(multiSelect)
    setMultiSelect([])
  }

  /* ---- handle mock file upload ---- */
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const names = Array.from(files).map((f) => f.name)
    setMockFiles((prev) => [...prev, ...names])
    e.target.value = ''
  }

  function handleFileConfirm() {
    if (mockFiles.length === 0) {
      pushUserMessage('No photos')
      advance([])
    } else {
      pushUserMessage(`Uploaded ${mockFiles.length} photo${mockFiles.length > 1 ? 's' : ''}: ${mockFiles.join(', ')}`)
      advance(mockFiles)
    }
    setMockFiles([])
  }

  /* ---- handle final submission ---- */
  async function handleFinalSubmit() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/owner/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      pushViraMessage("Sorry, something went wrong submitting your listing. Please try again.")
      setSubmitting(false)
    }
  }

  /* ---- handle key down ---- */
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  /* ---- textarea auto-resize ---- */
  function handleTextareaInput() {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
    }
  }

  /* ---- progress ---- */
  const progressPct = done ? 100 : Math.round((stepIdx / TOTAL_STEPS) * 100)

  /* ---- current step has widget? ---- */
  const currentStep = stepIdx < TOTAL_STEPS ? STEPS[stepIdx] : null
  const showTextInput = !done && currentStep && !currentStep.widget

  /* ---- step icon ---- */
  function stepIcon(idx: number) {
    const icons = [
      User, Phone, Phone, MapPin,
      Home, Ruler, Building, Calendar,
      IndianRupee, IndianRupee, Image, Home,
      Scale,
    ]
    const Icon = icons[idx] || Home
    return <Icon className="w-3.5 h-3.5" />
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50">
      {/* ---- Header ---- */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <ViraAvatar />
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Vira - List Your Property</h2>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
      </div>

      {/* ---- Progress bar ---- */}
      <div className="bg-white border-b border-gray-100 px-4 py-2">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
            {currentStep && stepIcon(stepIdx)}
            <span>
              Step {Math.min(stepIdx + 1, TOTAL_STEPS)} of {TOTAL_STEPS}
            </span>
          </div>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-vira-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-medium text-vira-600 flex-shrink-0">{progressPct}%</span>
        </div>
      </div>

      {/* ---- Messages ---- */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin bg-[#f0f2f5]">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <div key={msg.id}>
              {/* ---- Chat bubble ---- */}
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                <div
                  className={`flex items-end gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role === 'assistant' && <ViraAvatar />}
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-vira'}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {format(new Date(msg.timestamp), 'h:mm a')}
                    </span>
                  </div>
                </div>
              </div>

              {/* ---- Option pills ---- */}
              {msg.widget === 'options' && msg.options && msg === messages[messages.length - 1] && !typing && (
                <div className="ml-10 mb-4">
                  <div className="flex flex-wrap gap-2">
                    {msg.options.map((opt) => {
                      const step = STEPS[stepIdx]
                      const isMulti = step?.multi
                      const selected = isMulti && multiSelect.includes(opt)
                      return (
                        <button
                          key={opt}
                          onClick={() => handleOptionSelect(opt)}
                          className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            selected
                              ? 'bg-vira-600 text-white border-vira-600'
                              : 'bg-white text-vira-700 border-vira-200 hover:bg-vira-50 hover:border-vira-400'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {STEPS[stepIdx]?.multi && (
                    <button
                      onClick={handleMultiConfirm}
                      disabled={multiSelect.length === 0}
                      className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-vira-600 text-white text-sm font-medium rounded-full hover:bg-vira-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Confirm Selection
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* ---- File upload widget ---- */}
              {msg.widget === 'file-upload' && msg === messages[messages.length - 1] && !typing && (
                <div className="ml-10 mb-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="bg-white rounded-xl border border-gray-200 p-4 max-w-sm">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 flex flex-col items-center gap-2 text-gray-500 hover:border-vira-400 hover:text-vira-600 transition-colors"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-sm font-medium">Click to upload photos</span>
                      <span className="text-xs text-gray-400">JPG, PNG up to 10MB each</span>
                    </button>
                    {mockFiles.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {mockFiles.map((f, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-lg"
                          >
                            <Image className="w-4 h-4 text-vira-500" />
                            <span className="flex-1 truncate text-gray-700">{f}</span>
                            <button
                              onClick={() => setMockFiles((prev) => prev.filter((_, idx) => idx !== i))}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={handleFileConfirm}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-vira-600 text-white text-sm font-medium rounded-lg hover:bg-vira-700 transition-colors"
                    >
                      {mockFiles.length > 0 ? 'Continue with photos' : 'Skip photos'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ---- Summary card ---- */}
              {msg.widget === 'summary' && msg.summaryData && (
                <div className="ml-10 mb-4">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-lg">
                    <div className="bg-vira-600 px-4 py-3">
                      <h3 className="text-white font-semibold text-sm">Property Listing Summary</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {Object.entries(msg.summaryData).map(([key, val]) => (
                        <div key={key} className="px-4 py-2.5 flex gap-3">
                          <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0">
                            {labelFor(key)}
                          </span>
                          <span className="text-sm text-gray-800">
                            {Array.isArray(val)
                              ? val.length > 0
                                ? val.join(', ')
                                : 'None'
                              : val}
                          </span>
                        </div>
                      ))}
                    </div>
                    {!submitted && (
                      <div className="p-4 bg-gray-50">
                        <button
                          onClick={handleFinalSubmit}
                          disabled={submitting}
                          className="w-full py-2.5 bg-vira-600 text-white font-semibold text-sm rounded-lg hover:bg-vira-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Submit for Review
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ---- Success card ---- */}
          {submitted && (
            <div className="flex justify-start mb-3">
              <div className="flex items-end gap-2 max-w-[90%]">
                <ViraAvatar />
                <div className="flex flex-col items-start">
                  <div className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden max-w-md">
                    <div className="bg-green-50 p-6 flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-7 h-7 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-green-800 text-base mb-1">
                        Listing Submitted Successfully!
                      </h3>
                      <p className="text-sm text-green-700 leading-relaxed">
                        Your property listing is now pending admin approval. We'll reach out to you via
                        email once it's been reviewed.
                      </p>
                    </div>
                    <div className="p-4 flex gap-2">
                      <Link
                        href="/"
                        className="flex-1 text-center py-2 bg-vira-600 text-white text-sm font-medium rounded-lg hover:bg-vira-700 transition-colors"
                      >
                        Go to Home
                      </Link>
                      <button
                        onClick={() => window.location.reload()}
                        className="flex-1 text-center py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Submit Another
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {typing && <TypingDots />}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* ---- Input area ---- */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="max-w-3xl mx-auto">
          {showTextInput ? (
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onInput={handleTextareaInput}
                  placeholder="Type your answer..."
                  rows={1}
                  className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none max-h-[120px]"
                  disabled={typing}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="p-2.5 bg-vira-600 text-white rounded-full hover:bg-vira-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="text-center text-xs text-gray-400 py-2">
              {done
                ? submitted
                  ? 'Thank you for your submission!'
                  : 'Review your listing above and submit when ready.'
                : 'Please use the options above to respond.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
