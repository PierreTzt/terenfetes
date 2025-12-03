import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/settings
 * Get site settings (or create default if none exist)
 */
export async function GET() {
  try {
    // Get the first (and only) settings record
    let settings = await prisma.siteSettings.findFirst()

    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          siteName: 'Territoire en Fête',
          slogan: 'Tout ce qui bouge près de chez vous.',
        },
      })
    }

    return NextResponse.json({
      data: settings,
    })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/settings
 * Update site settings
 * Body: { siteName, slogan, logoUrl?, faviconUrl? }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { siteName, slogan, logoUrl, faviconUrl } = body

    // Validation
    if (!siteName || typeof siteName !== 'string' || siteName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Site name is required' },
        { status: 400 }
      )
    }

    if (!slogan || typeof slogan !== 'string' || slogan.trim().length === 0) {
      return NextResponse.json(
        { error: 'Slogan is required' },
        { status: 400 }
      )
    }

    // Get existing settings or create new
    let settings = await prisma.siteSettings.findFirst()

    if (settings) {
      // Update existing
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          siteName: siteName.trim(),
          slogan: slogan.trim(),
          logoUrl: logoUrl || null,
          faviconUrl: faviconUrl || null,
        },
      })
    } else {
      // Create new
      settings = await prisma.siteSettings.create({
        data: {
          siteName: siteName.trim(),
          slogan: slogan.trim(),
          logoUrl: logoUrl || null,
          faviconUrl: faviconUrl || null,
        },
      })
    }

    return NextResponse.json({
      data: settings,
    })
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json(
      { error: 'Failed to update site settings' },
      { status: 500 }
    )
  }
}
