import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {AggregatedResponse, GetFormResponse, MyFormsResponse } from '../types/types';

type SubmitFormArgs = {
    templateId: string;
    answers: {
        questionId: string;
        value: string | number | boolean
    }[];
}

type SubmitFormResponse = {
    form: {
        id: string;
        templateId: string;
        answers: { id: string; questionId: string; value: string | number | boolean }[];
    };
}
type UpdateFormArgs = {
    formId: string;
    templateId: string;
    answers: {
        questionId: string;
        value: string | number | boolean;
    }[];
}
export const formApi = createApi({
    reducerPath: 'formApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://formify-app.onrender.com/forms',
        credentials: 'include',
    }),
    tagTypes: ['Form', 'FormById'],
    endpoints: (build) => ({
        submitForm: build.mutation<SubmitFormResponse, SubmitFormArgs>({
            query: ({ templateId, answers }) => ({
                url: '/',
                method: 'POST',
                body: { templateId, answers },
            }),
            invalidatesTags: (_, __, { templateId }) => [
                { type: 'Form', id: 'LIST' },
                { type: 'Form', id: `AGGREGATED-${templateId}` },
            ],
        }),
        getMyForms: build.query<MyFormsResponse, { skip?: number }>({
            query: ({ skip = 0 } = {}) => `/mine?skip=${skip}`,
            providesTags: (result) =>
                result?.forms
                    ? [
                        ...result.forms.map((f) => ({ type: 'Form' as const, id: f.id })),
                        { type: 'Form', id: 'LIST' },
                    ]
                    : [{ type: 'Form', id: 'LIST' }],
        }),
        updateForm: build.mutation<{ message: string }, UpdateFormArgs>({
            query: ({ formId, answers }) => ({
                url: `/${formId}`,
                method: 'PATCH',
                body: { answers },
            }),
            invalidatesTags: (_, __, { formId, templateId }) => [
                { type: 'Form', id: formId },
                { type: 'FormById', id: formId },
                { type: 'Form', id: `AGGREGATED-${templateId}` },
            ],
        }),
        getFormById: build.query<GetFormResponse, string>({
            query: (formId) => `/${formId}`,
            providesTags: (_, __, formId) => [{ type: 'FormById', id: formId }],
        }),
        deleteForm: build.mutation<{ message: string }, { formId: string; templateId: string }>({
            query: ({ formId }) => ({
                url: `/${formId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_, __, { formId, templateId }) => [
                { type: 'Form', id: formId },
                { type: 'FormById', id: formId },
                { type: 'Form', id: 'LIST' },
                { type: 'Form', id: `AGGREGATED-${templateId}` },
            ],
        }),
        getAggregatedData: build.query<AggregatedResponse, string>({
            query: (templateId) => `/aggregated/${templateId}`,
            providesTags: (_, __, templateId) => [{ type: 'Form', id: `AGGREGATED-${templateId}` }],
        }),
    }),
});

export const {  useSubmitFormMutation,
                useGetMyFormsQuery,
                useUpdateFormMutation,
                useGetFormByIdQuery,
                useDeleteFormMutation,
                useGetAggregatedDataQuery} = formApi;
