import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      ownerName,
      contactEmail,
      contactPhone,
      propertyAddress,
      propertyType,
      size,
      floors,
      ageOfProperty,
      askingPrice,
      negotiable,
      photos,
      currentStatus,
      legalStatus,
    } = body

    // --- Basic validation ---
    if (!ownerName || !contactEmail || !propertyAddress || !propertyType) {
      return NextResponse.json(
        { error: 'Missing required fields: ownerName, contactEmail, propertyAddress, propertyType' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // --- Build the submission record ---
    const submissionId = uuidv4()
    const propertyId = uuidv4()

    const isNegotiable =
      negotiable === 'Fixed price'
        ? false
        : true

    const submission = {
      id: submissionId,
      type: 'owner' as const,
      status: 'pending' as const,
      submitted_at: new Date().toISOString(),
      owner: {
        name: ownerName,
        email: contactEmail,
        phone: contactPhone || null,
      },
      property: {
        id: propertyId,
        address: propertyAddress,
        type: propertyType,
        size: size || null,
        floors: floors || null,
        age: ageOfProperty || null,
        asking_price: askingPrice || null,
        negotiable: isNegotiable,
        negotiable_label: negotiable || null,
        photos: Array.isArray(photos) ? photos : [],
        current_status: currentStatus || null,
        legal_status: legalStatus || null,
      },
    }

    // --- In a real app, save to Supabase ---
    // const { data, error } = await supabase.from('owner_submissions').insert(...)
    // For now we just log it and return success.
    console.log('[Owner Submission]', JSON.stringify(submission, null, 2))

    return NextResponse.json(
      {
        success: true,
        message: 'Your property listing has been submitted for review.',
        submissionId,
        propertyId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Owner Submit Error]', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
