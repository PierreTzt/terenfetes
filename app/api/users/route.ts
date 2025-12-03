import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/users?email=xxx
 * Get user by email
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json(
      { error: 'email is required' },
      { status: 400 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
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
 * POST /api/users
 * Create a new user
 * Body: { email: string, name?: string, avatar?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, avatar } = body

    if (!email) {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email,
        name,
        avatar,
        profile: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    })

    return NextResponse.json(
      {
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
        message: 'User created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
