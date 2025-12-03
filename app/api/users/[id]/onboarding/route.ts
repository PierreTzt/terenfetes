import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/users/[id]/onboarding
 * Complete onboarding for a user
 * Body: { defaultCity?: string, interests?: string[], preferences?: any }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { defaultCity, interests, preferences } = body

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        onboarded: true,
        ...(defaultCity && { defaultCity }),
        ...(interests && { interests }),
      },
    })

    // Update or create profile
    let profile = await prisma.userProfile.findUnique({
      where: { userId: id },
    })

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId: id,
          ...(preferences && { preferences }),
        },
      })
    } else if (preferences) {
      profile = await prisma.userProfile.update({
        where: { userId: id },
        data: {
          preferences,
        },
      })
    }

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        onboarded: user.onboarded,
        defaultCity: user.defaultCity || undefined,
        interests: user.interests,
      },
      message: 'Onboarding completed successfully',
    })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}
