import {Tag, Template, User } from "@prisma/client"
import { prisma } from "../prisma"

type AuthorPreview = Pick<User, "id" | "nickname">
export async function toTemplateCardDto(template: Template & { author: AuthorPreview, tags: Tag[], _count: { likes: number } }, userId?: string) {
    const liked = userId
        ? await prisma.like.findFirst({
            where: { userId, templateId: template.id },
            select: { id: true },
        })
        : null

    return {
        id: template.id,
        title: template.title,
        description: template.description,
        topic: template.topic,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        authorId: template.authorId,
        isPublic: template.isPublic,
        author: {
            id: template.author.id,
            nickname: template.author.nickname,
        },
        tags: template.tags,
        likesCount: template._count.likes,
        likedByUser: Boolean(liked),
    }
}