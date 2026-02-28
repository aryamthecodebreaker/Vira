import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Generate a simple session token
    const sessionToken = Buffer.from(
      `admin_${Date.now()}_${Math.random().toString(36).substring(2)}`
    ).toString('base64')

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
    })

    // Set session cookie (expires in 24 hours)
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  })

  response.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get('admin_session')

  if (!session || !session.value) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }

  return NextResponse.json({ authenticated: true })
}
