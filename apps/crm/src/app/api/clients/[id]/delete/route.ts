import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth/authorize'
import { forbiddenResponse, notFoundResponse } from '@/lib/api/responses'
import { handleError } from '@/lib/utils/errors'

// POST /api/clients/[id]/delete - Permanently delete a client
// Using POST to distinguish from soft delete (which uses DELETE)
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication and admin role
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return forbiddenResponse('Only administrators can permanently delete clients')
        }

        const client = await prisma.client.findUnique({
            where: { id: params.id },
        })

        if (!client) {
            return notFoundResponse('Client')
        }

        // Delete related records first (cascade)
        await prisma.$transaction(async (tx) => {
            // Delete activities
            await tx.activity.deleteMany({
                where: { clientId: params.id },
            })

            // Delete notes
            await tx.note.deleteMany({
                where: { clientId: params.id },
            })

            // Delete files
            await tx.file.deleteMany({
                where: { clientId: params.id },
            })

            // Delete business plans
            await tx.businessPlan.deleteMany({
                where: { clientId: params.id },
            })

            // Delete deliverables
            await tx.deliverable.deleteMany({
                where: { clientId: params.id },
            })

            // Delete tickets
            await tx.ticket.deleteMany({
                where: { clientId: params.id },
            })

            // Finally delete the client
            await tx.client.delete({
                where: { id: params.id },
            })
        })

        return NextResponse.json({
            success: true,
            message: 'Client permanently deleted',
        })
    } catch (error) {
        console.error('Failed to permanently delete client:', error)
        const err = handleError(error)
        return NextResponse.json(
            { success: false, error: err.message },
            { status: err.statusCode }
        )
    }
}
