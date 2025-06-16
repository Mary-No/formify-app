import { prisma } from "../prisma"

export async function isAuthorOrAdmin({
                                          userId,
                                          resourceAuthorId,
                                      }: {
    userId: string
    resourceAuthorId: string
}): Promise<boolean> {
    if (userId === resourceAuthorId) return true

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true },
    })

    return !!user?.isAdmin
}