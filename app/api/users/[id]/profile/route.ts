import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/users/[id]/profile
 * Get user profile
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: id },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        id: profile.id,
        userId: profile.userId,
        savedFilters: profile.savedFilters || undefined,
        preferences: profile.preferences || undefined,
        followedVenues: profile.followedVenues,
        followedCategories: profile.followedCategories,
        followedCities: profile.followedCities,
      },
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/users/[id]/profile
 * Update user profile
 * Body: { savedFilters?: any, preferences?: any, followedVenues?: string[], followedCategories?: string[], followedCities?: string[] }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { savedFilters, preferences, followedVenues, followedCategories, followedCities } = body

    // Ensure profile exists
    let profile = await prisma.userProfile.findUnique({
      where: { userId: id },
    })

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await prisma.userProfile.create({
        data: {
          userId: id,
        },
      })
    }

    // Update profile
    const updatedProfile = await prisma.userProfile.update({
      where: { userId: id },
      data: {
        ...(savedFilters !== undefined && { savedFilters }),
        ...(preferences !== undefined && { preferences }),
        ...(followedVenues !== undefined && { followedVenues }),
        ...(followedCategories !== undefined && { followedCategories }),
        ...(followedCities !== undefined && { followedCities }),
      },
    })

    return NextResponse.json({
      data: {
        id: updatedProfile.id,
        userId: updatedProfile.userId,
        savedFilters: updatedProfile.savedFilters || undefined,
        preferences: updatedProfile.preferences || undefined,
        followedVenues: updatedProfile.followedVenues,
        followedCategories: updatedProfile.followedCategories,
        followedCities: updatedProfile.followedCities,
      },
      message: 'Profile updated successfully',
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
