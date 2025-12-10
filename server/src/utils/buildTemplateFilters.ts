function buildTemplateFilters({ userId, topic, tags, search }: any) {
    const filters: any = {};
   filters.isPublic = true;

    if (topic) filters.topic = topic;

    if (tags?.length) filters.tags = { some: { name: { in: tags } } };

    if (search) {
        filters.AND = [
            ...(filters.AND || []),
            {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { comments: { some: { text: { contains: search, mode: 'insensitive' } } } },
                ],
            },
        ];
    }

    return filters;
}