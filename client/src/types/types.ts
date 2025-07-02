// template types
export type Tag = {
    id: string,
    name: string
}

export type Topic =
    | 'TECHNOLOGY'
    | 'HEALTH'
    | 'EDUCATION'
    | 'BUSINESS'
    | 'ENTERTAINMENT'
    | 'SCIENCE'
    | 'LIFESTYLE'
    | 'ENVIRONMENT'
    | 'POLITICS'
    | 'TRAVEL'
    | 'CULTURE'
    | 'PERSONAL'
    | 'RELATIONSHIPS'
    | 'MARKETING'
    | 'PRODUCTIVITY'
    | 'FINANCE'
    | 'FOOD'
    | 'SPORT'
    | 'PSYCHOLOGY'
    | 'OTHER'


export type QuestionType = 'SHORT_TEXT' | 'LONG_TEXT' | 'INTEGER' | 'CHECKBOX' | 'SINGLE_CHOICE'| 'IMAGE';

export type Question = {
    id: string
    templateId: string
    text: string
    type: QuestionType
    order: number
    required: boolean
    updatedAt: string
    options?: string[];
    imageUrl?: string
}

export type Author = {
    id: string
    nickname: string
}
export type Template = {
    id: string
    title: string
    description: string
    topic: Topic
    createdAt: string
    updatedAt: string
    authorId: string
    isPublic: boolean
    author: Author
    tags: Tag[]
    likesCount: number
    likedByUser: boolean
}
export type TemplateListResponse = {
    templates: Template[]
}
export type SearchTemplatesArgs = {
    skip?: number
    search?: string
    topic?: string
    tags?: string[]
    order?: 'asc' | 'desc'
    mine?: boolean
}

export type OverviewResponse = {
    popular: Template[]
    latest: Template[]
}

export type Comment = {
    id: string
    templateId: string
    authorId: string
    text: string
    createdAt: string
    updatedAt: string
    author: Author
}

export type FullTemplate = Template & {
    questions: Question[]
    comments: Comment[]
}

export type TemplateDetailResponse = {
    template: FullTemplate
    likesCount: number
    likedByUser: boolean
}
export type CreateTemplatePayload = {
    title: string
    description: string
    topic: Topic
    tags: string[]
    isPublic: boolean
    questions: NewQuestion[]
}
export type NewQuestion = Pick<Question, 'text' | 'type' | 'required'>

export type CreateTemplateResponse = {
    template: FullTemplate
}

//auth types

export type RegisterPayload = {
    email: string
    password: string
    nickname: string
}

export type UserResponse = {
    message: string
    user: User
}
export type User = {
    id: string
    email: string
    nickname: string
    isAdmin: boolean
    isBlocked: boolean
}

export type AuthUser = User | null

export type UserLogin = { id: string; email: string; nickname: string }

// form types

export type MyFormsResponse = {
    forms: {
        id: string;
        createdAt: string;
        updatedAt: string;
        emailSent: boolean;
        template: {
            id: string;
            title: string;
        };
    }[];
};
export type GetFormResponse = {
        id: string;
        templateId: string;
        createdAt: string;
        updatedAt: string;
        answers: {
            id: string;
            questionId: string;
            value: string | number | boolean;
        }[];
        template: {
            id: string;
            title: string;
            description: string;
            questions: {
                id: string;
                text: string;
                type: 'SHORT_TEXT' | 'LONG_TEXT' | 'INTEGER' | 'CHECKBOX';
                required: boolean;
                order: number;
                options?: string[];
            }[];
        };
};

//statistic types
export type AggregatedAnswer = {
    author: string;
    userId: string;
    value: string | number | boolean;
};

export type AggregatedQuestion = {
    id: string;
    text: string;
    type: QuestionType
    answers: AggregatedAnswer[];
    options?: string[];
    imageUrl?: string
};

export type AggregatedResponse = {
    questions: AggregatedQuestion[];
};

//admin types
export type BatchAction = 'delete' | 'block' | 'unblock' | 'promote' | 'demote'

export type AdminUser = User & {
    createdAt: string;
};

export type UsersResponse = {
    users: AdminUser[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type BatchActionPayload = {
    userIds: string[];
    action: BatchAction;
};