import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      agentName,
      agency,
      contactEmail,
      contactPhone,
      projectName,
      developerName,
      location,
      propertyType,
      configurations,
      priceMin,
      priceMax,
      photos,
      usps,
      reraNumber,
      websiteLink,
    } = body

    // --- Basic validation ---
    if (!agentName || !contactEmail || !projectName || !location || !propertyType) {
      return NextResponse.json(
        { error: 'Missing required fields: agentName, contactEmail, projectName, location, propertyType' },
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

    const submission = {
      id: submissionId,
      type: 'partner' as const,
      status: 'pending' as const,
      submitted_at: new Date().toISOString(),
      agent: {
        name: agentName,
        agency: agency || null,
        email: contactEmail,
        phone: contactPhone || null,
      },
      property: {
        id: propertyId,
        name: projectName,
        developer: developerName || null,
        location,
        type: propertyType,
        configurations: Array.isArray(configurations) ? configurations : [],
        price_min: priceMin || null,
        price_max: priceMax || null,
        photos: Array.isArray(photos) ? photos : [],
        usps: Array.isArray(usps) ? usps : [],
        rera_number: reraNumber || null,
        website: websiteLink && websiteLink.toLowerCase() !== 'skip' ? websiteLink : null,
      },
    }

    // --- In a real app, save to Supabase ---
    // const { data, error } = await supabase.from('partner_submissions').insert(...)
    // For now we just log it and return success.
    console.log('[Partner Submission]', JSON.stringify(submission, null, 2))

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
    console.error('[Partner Submit Error]', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
