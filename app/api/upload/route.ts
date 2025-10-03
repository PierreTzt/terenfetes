import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/upload'
import { getClientIp, checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(`upload:${clientIp}`, 10, 60 * 60 * 1000) // 10 uploads per hour

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Trop de tentatives. Veuillez réessayer plus tard.',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const url = await uploadImage(file)

    if (!url) {
      return NextResponse.json(
        { error: 'Échec de l\'upload de l\'image' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    )
  }
}
