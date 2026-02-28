import { NextRequest, NextResponse } from 'next/server'

// Mock properties data
const mockProperties = [
  {
    id: '1',
    title: '3 BHK Apartment in Bandra West',
    type: 'Apartment',
    status: 'active',
    price: 25000000,
    location: 'Bandra West, Mumbai',
    bedrooms: 3,
    bathrooms: 2,
    area: 1450,
    listed_date: '2026-01-15',
    views: 342,
    inquiries: 18,
    owner: 'Rajesh Sharma',
    owner_phone: '+91 98765 43210',
  },
  {
    id: '2',
    title: '2 BHK Flat in Andheri East',
    type: 'Apartment',
    status: 'active',
    price: 12000000,
    location: 'Andheri East, Mumbai',
    bedrooms: 2,
    bathrooms: 2,
    area: 950,
    listed_date: '2026-01-20',
    views: 567,
    inquiries: 32,
    owner: 'Priya Patel',
    owner_phone: '+91 98765 43211',
  },
  {
    id: '3',
    title: 'Luxury Villa in Juhu',
    type: 'Villa',
    status: 'active',
    price: 85000000,
    location: 'Juhu, Mumbai',
    bedrooms: 5,
    bathrooms: 4,
    area: 3500,
    listed_date: '2026-02-01',
    views: 890,
    inquiries: 12,
    owner: 'Amit Desai',
    owner_phone: '+91 98765 43212',
  },
  {
    id: '4',
    title: '1 BHK Studio in Powai',
    type: 'Apartment',
    status: 'inactive',
    price: 7500000,
    location: 'Powai, Mumbai',
    bedrooms: 1,
    bathrooms: 1,
    area: 550,
    listed_date: '2025-12-10',
    views: 231,
    inquiries: 8,
    owner: 'Sunita Reddy',
    owner_phone: '+91 98765 43213',
  },
  {
    id: '5',
    title: '4 BHK Penthouse in Worli',
    type: 'Penthouse',
    status: 'active',
    price: 120000000,
    location: 'Worli, Mumbai',
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    listed_date: '2026-02-10',
    views: 1203,
    inquiries: 45,
    owner: 'Vikram Malhotra',
    owner_phone: '+91 98765 43214',
  },
  {
    id: '6',
    title: '2 BHK in Thane West',
    type: 'Apartment',
    status: 'active',
    price: 8500000,
    location: 'Thane West, Thane',
    bedrooms: 2,
    bathrooms: 2,
    area: 850,
    listed_date: '2026-02-14',
    views: 145,
    inquiries: 6,
    owner: 'Neha Gupta',
    owner_phone: '+91 98765 43215',
  },
  {
    id: '7',
    title: 'Commercial Office Space in BKC',
    type: 'Commercial',
    status: 'active',
    price: 45000000,
    location: 'BKC, Mumbai',
    bedrooms: 0,
    bathrooms: 2,
    area: 2000,
    listed_date: '2026-01-28',
    views: 412,
    inquiries: 22,
    owner: 'Rajan Industries',
    owner_phone: '+91 98765 43216',
  },
  {
    id: '8',
    title: '3 BHK Row House in Navi Mumbai',
    type: 'Row House',
    status: 'pending',
    price: 15000000,
    location: 'Kharghar, Navi Mumbai',
    bedrooms: 3,
    bathrooms: 3,
    area: 1800,
    listed_date: '2026-02-20',
    views: 67,
    inquiries: 3,
    owner: 'Deepak Joshi',
    owner_phone: '+91 98765 43217',
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
  const search = searchParams.get('search')

  let filtered = [...mockProperties]

  if (status && status !== 'all') {
    filtered = filtered.filter((p) => p.status === status)
  }

  if (type && type !== 'all') {
    filtered = filtered.filter((p) => p.type === type)
  }

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q)
    )
  }

  return NextResponse.json({
    properties: filtered,
    total: filtered.length,
  })
}

export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const newProperty = {
    id: String(mockProperties.length + 1),
    ...body,
    listed_date: new Date().toISOString().split('T')[0],
    views: 0,
    inquiries: 0,
  }

  return NextResponse.json({
    success: true,
    property: newProperty,
    message: 'Property created successfully',
  })
}

export async function PUT(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  return NextResponse.json({
    success: true,
    property: body,
    message: 'Property updated successfully',
  })
}

export async function DELETE(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    message: `Property ${id} deleted successfully`,
  })
}
