import {Tag, Template, User } from "@prisma/client"

type AuthorPreview = Pick<User, "id" | "nickname">
export function toTemplateCardDto(
    template: Template & {
        author: AuthorPreview,
        tags: Tag[],
        _count: { likes: number },
        likes?: { userId: string }[]
    },
    userId?: string
) {
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
        likedByUser: userId
            ? template.likes?.some(like => like.userId === userId) ?? false
            : false,
    }
}