import type {
    CreateTemplatePayload,
    CreateTemplateResponse,
    OverviewResponse,
    SearchTemplatesArgs,
    TemplateDetailResponse,
    TemplateListResponse
} from "../types/types"
import {api} from "./api.ts";

export const templateApi  = api.injectEndpoints({
    endpoints: (build) => ({
        getTags: build.query<{ value: string; count: number }[], number | void>({
            query: (limit = 30) => `templates/tags?limit=${limit}`,
        }),
        searchTemplates: build.query<TemplateListResponse, SearchTemplatesArgs>({
            query: ({ skip = 0, search, topic, tags, order = 'desc', mine }) => {
                const params = new URLSearchParams();
                params.set('skip', skip.toString());
                if (search) params.set('search', search);
                if (topic) params.set('topic', topic);
                if (order) params.set('order', order);
                if (tags && tags.length) tags.forEach(tag => params.append('tags', tag));

                const url = mine ? `/templates/mine` : `/templates`;
                return mine ? `${url}?${params.toString()}` : `${url}?${params.toString()}`;
            },
            providesTags: (result) =>
                result
                    ? [
                        { type: 'TemplatesList' },
                        ...result.templates.map(({ id }) => ({ type: 'Template' as const, id })),
                    ]
                    : [{ type: 'TemplatesList' }],
        }),
        createTemplate: build.mutation<CreateTemplateResponse, CreateTemplatePayload>({
            query: (body) => ({
                url: '/templates',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['TemplatesList', 'Template'],
        }),
        deleteTemplate: build.mutation<{ message: string }, string>({
            query: (templateId) => ({
                url: `/templates/${templateId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['TemplatesList', 'Template'],
        }),
        getTemplate: build.query<TemplateDetailResponse, string>({
            query: (templateId) => `/templates/${templateId}`,
            providesTags: (_result, _error, arg) => [{ type: 'Template', id: arg }],
        }),
        toggleLikeTemplate: build.mutation<{ message: string }, string>({
            query: (templateId) => ({
                url: `/templates/${templateId}/like`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, templateId) => [
                { type: 'Template', id: templateId },
                { type: 'TemplatesList' },
            ],
        }),
        getOverview: build.query<OverviewResponse, void>({
            query: () => 'templates/overview',
            providesTags: (result) =>
                result
                    ? [
                        { type: 'TemplatesList' },
                        ...result.popular.map(({ id }) => ({ type: 'Template' as const, id })),
                        ...result.latest.map(({ id }) => ({ type: 'Template' as const, id })),
                    ]
                    : [{ type: 'TemplatesList' }],
        }),
        addComment: build.mutation<{ comment: Comment }, { templateId: string; text: string }>({
            query: ({ templateId, text }) => ({
                url: `/templates/${templateId}/comments`,
                method: 'POST',
                body: { text },
            }),
            invalidatesTags: (_result, _error, { templateId }) => [{ type: 'Template', id: templateId }],
        }),
        updateTemplate: build.mutation<void, { id: string; data: CreateTemplatePayload }>({
            query: ({ id, data }) => ({
                url: `/templates/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['TemplatesList', 'Template'],
        }),
    }),
})

export const {  useGetTagsQuery,
                useSearchTemplatesQuery,
                useGetTemplateQuery,
                useToggleLikeTemplateMutation,
                useGetOverviewQuery,
                useAddCommentMutation,
                useCreateTemplateMutation,
                useDeleteTemplateMutation,
                useUpdateTemplateMutation } = templateApi