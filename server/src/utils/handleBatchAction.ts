import { prisma } from '../prisma'
import { z } from 'zod'

export const UserBatchAction = z.enum([
    'block',
    'unblock',
    'promote',
    'demote',
    'delete'
])

export type UserBatchAction = z.infer<typeof UserBatchAction>

export const batchActionSchema = z.object({
    userIds: z.string().uuid().array().nonempty(),
    action: UserBatchAction
})

export async function handleBatchAction(
    userIds: string[],
    action: UserBatchAction,
    currentUserId: string
): Promise<{ affected: string[]; demotedSelf?: boolean }> {
    const filteredIds =
        action === 'delete'
            ? userIds.filter((id) => id !== currentUserId)
            : userIds

    if (filteredIds.length === 0) {
        throw new Error('Nothing to process (cannot affect yourself)')
    }

    switch (action) {
        case 'block':
            await prisma.user.updateMany({ where: { id: { in: filteredIds } }, data: { isBlocked: true } })
            break
        case 'unblock':
            await prisma.user.updateMany({ where: { id: { in: filteredIds } }, data: { isBlocked: false } })
            break
        case 'promote':
            await prisma.user.updateMany({ where: { id: { in: filteredIds } }, data: { isAdmin: true } })
            break
        case 'demote':
            await prisma.user.updateMany({ where: { id: { in: filteredIds } }, data: { isAdmin: false } })
            break
        case 'delete':
            await prisma.user.deleteMany({ where: { id: { in: filteredIds } } })
            break
    }

    return {
        affected: filteredIds,
        demotedSelf: action === 'demote' && userIds.includes(currentUserId)
    }
}
