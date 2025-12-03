import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/users/[id]
 * Get user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        avatar: user.avatar || undefined,
        onboarded: user.onboarded,
        defaultCity: user.defaultCity || undefined,
        interests: user.interests,
        createdAt: user.createdAt.toISOString(),
        profile: user.profile ? {
          id: user.profile.id,
          userId: user.profile.userId,
          savedFilters: user.profile.savedFilters || undefined,
          preferences: user.profile.preferences || undefined,
          followedVenues: user.profile.followedVenues,
          followedCategories: user.profile.followedCategories,
          followedCities: user.profile.followedCities,
        } : undefined,
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/users/[id]
 * Update user
 * Body: { name?: string, avatar?: string, defaultCity?: string, interests?: string[] }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { name, avatar, defaultCity, interests } = body

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(avatar !== undefined && { avatar }),
        ...(defaultCity !== undefined && { defaultCity }),
        ...(interests !== undefined && { interests }),
      },
    })

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        avatar: user.avatar || undefined,
        onboarded: user.onboarded,
        defaultCity: user.defaultCity || undefined,
        interests: user.interests,
        createdAt: user.createdAt.toISOString(),
      },
      message: 'User updated successfully',
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users/[id]
 * Delete user (with cascade delete of profile, favorites, etc.)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
