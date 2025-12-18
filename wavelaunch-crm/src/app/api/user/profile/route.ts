import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        phone: true,
        location: true,
        website: true,
        createdAt: true,
        lastLogin: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, bio, phone, location, website } = body

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || undefined,
        bio: bio || undefined,
        phone: phone || undefined,
        location: location || undefined,
        website: website || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        phone: true,
        location: true,
        website: true,
        createdAt: true,
        lastLogin: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
