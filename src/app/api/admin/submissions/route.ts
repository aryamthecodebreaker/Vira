import { NextRequest, NextResponse } from 'next/server'

// Mock submissions data
const mockSubmissions = [
  {
    id: 'sub_1',
    type: 'partner',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@realty.com',
    phone: '+91 99887 76655',
    company: 'Mehta Realty Associates',
    license_number: 'RERA-MH-2024-001234',
    experience_years: 8,
    specialization: 'Residential Sales',
    locations: ['Bandra', 'Juhu', 'Andheri'],
    message: 'I have been working in the Mumbai real estate market for over 8 years and would like to partner with Vira to expand my reach to tech-savvy buyers.',
    status: 'pending',
    submitted_at: '2026-02-25T10:30:00Z',
  },
  {
    id: 'sub_2',
    type: 'owner',
    name: 'Kavita Nair',
    email: 'kavita.nair@gmail.com',
    phone: '+91 88776 65544',
    property_type: 'Apartment',
    property_location: 'Powai, Mumbai',
    property_details: '2 BHK apartment, 1050 sq ft, lake-facing, 12th floor, semi-furnished with modular kitchen',
    expected_price: 14500000,
    status: 'pending',
    submitted_at: '2026-02-24T14:15:00Z',
  },
  {
    id: 'sub_3',
    type: 'partner',
    name: 'Siddharth Kulkarni',
    email: 'sid.kulkarni@propertyzone.in',
    phone: '+91 77665 54433',
    company: 'PropertyZone India',
    license_number: 'RERA-MH-2024-005678',
    experience_years: 12,
    specialization: 'Commercial & Residential',
    locations: ['BKC', 'Lower Parel', 'Worli'],
    message: 'PropertyZone has been a leading name in the Mumbai commercial real estate space. We are interested in integrating with Vira for our client outreach.',
    status: 'approved',
    submitted_at: '2026-02-20T09:45:00Z',
    reviewed_at: '2026-02-22T11:00:00Z',
  },
  {
    id: 'sub_4',
    type: 'owner',
    name: 'Ramesh Iyer',
    email: 'ramesh.iyer@yahoo.com',
    phone: '+91 66554 43322',
    property_type: 'Villa',
    property_location: 'Lonavala, Pune',
    property_details: '4 BHK villa, 3200 sq ft, private garden, swimming pool, mountain view, fully furnished',
    expected_price: 35000000,
    status: 'approved',
    submitted_at: '2026-02-18T16:30:00Z',
    reviewed_at: '2026-02-19T10:15:00Z',
  },
  {
    id: 'sub_5',
    type: 'partner',
    name: 'Fatima Sheikh',
    email: 'fatima.sheikh@homefinders.co.in',
    phone: '+91 55443 32211',
    company: 'HomeFinders Co.',
    license_number: 'RERA-MH-2023-009012',
    experience_years: 5,
    specialization: 'Rental Properties',
    locations: ['Thane', 'Navi Mumbai'],
    message: 'We specialize in rental properties across Thane and Navi Mumbai. Looking to collaborate with Vira for listing and lead generation.',
    status: 'rejected',
    submitted_at: '2026-02-15T08:00:00Z',
    reviewed_at: '2026-02-17T14:30:00Z',
    rejection_reason: 'Incomplete documentation provided. Please resubmit with valid RERA certification.',
  },
  {
    id: 'sub_6',
    type: 'owner',
    name: 'Ananya Bhatt',
    email: 'ananya.bhatt@outlook.com',
    phone: '+91 44332 21100',
    property_type: 'Apartment',
    property_location: 'Goregaon West, Mumbai',
    property_details: '3 BHK apartment, 1350 sq ft, gym and pool in society, 8th floor, east-facing',
    expected_price: 18000000,
    status: 'pending',
    submitted_at: '2026-02-27T12:00:00Z',
  },
  {
    id: 'sub_7',
    type: 'owner',
    name: 'Prakash Jain',
    email: 'p.jain@gmail.com',
    phone: '+91 33221 10099',
    property_type: 'Commercial',
    property_location: 'Nariman Point, Mumbai',
    property_details: 'Office space, 4500 sq ft, fully furnished with conference rooms, sea-facing, 18th floor',
    expected_price: 95000000,
    status: 'pending',
    submitted_at: '2026-02-26T17:45:00Z',
  },
]

function checkAdminAuth(request: NextRequest): boolean {
  const session = request.cookies.get('admin_session')
  return !!(session && session.value)
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')

  let filtered = [...mockSubmissions]

  if (status && status !== 'all') {
    filtered = filtered.filter((s) => s.status === status)
  }

  if (type && type !== 'all') {
    filtered = filtered.filter((s) => s.type === type)
  }

  const stats = {
    total: mockSubmissions.length,
    pending: mockSubmissions.filter((s) => s.status === 'pending').length,
    approved: mockSubmissions.filter((s) => s.status === 'approved').length,
    rejected: mockSubmissions.filter((s) => s.status === 'rejected').length,
  }

  return NextResponse.json({
    submissions: filtered,
    stats,
  })
}

export async function PUT(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, action, rejection_reason } = body

  if (!id || !action) {
    return NextResponse.json(
      { error: 'Submission ID and action are required' },
      { status: 400 }
    )
  }

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json(
      { error: 'Action must be either "approve" or "reject"' },
      { status: 400 }
    )
  }

  if (action === 'reject' && !rejection_reason) {
    return NextResponse.json(
      { error: 'Rejection reason is required' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    message: `Submission ${id} has been ${action === 'approve' ? 'approved' : 'rejected'}`,
  })
}
