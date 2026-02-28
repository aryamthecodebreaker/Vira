import { NextRequest, NextResponse } from 'next/server'

// In-memory store for demo (replace with Supabase when connected)
const preferencesStore = new Map<string, Record<string, unknown>>()

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const prefs = preferencesStore.get(userId) || null
  return NextResponse.json({ preferences: prefs })
}

export async function POST(req: NextRequest) {
  try {
    const { userId, preferences } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const existing = preferencesStore.get(userId) || {}
    const merged = { ...existing, ...preferences, updated_at: new Date().toISOString() }
    preferencesStore.set(userId, merged)

    return NextResponse.json({ preferences: merged })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
