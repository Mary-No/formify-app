import type {AggregatedResponse, GetFormResponse, MyFormsResponse } from '../types/types';
import {api} from "./api.ts";

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
export const formApi = api.injectEndpoints({
    endpoints: (build) => ({
        submitForm: build.mutation<SubmitFormResponse, SubmitFormArgs>({
            query: ({ templateId, answers }) => ({
                url: '/forms/',
                method: 'POST',
                body: { templateId, answers },
            }),
            invalidatesTags: (_, __, { templateId }) => [
                { type: 'Form', id: 'LIST' },
                { type: 'Form', id: `AGGREGATED-${templateId}` },
            ],
        }),
        getMyForms: build.query<MyFormsResponse, { skip?: number }>({
            query: ({ skip = 0 } = {}) => `/forms/mine?skip=${skip}`,
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
                url: `/forms/${formId}`,
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
            query: (formId) => `/forms/${formId}`,
            providesTags: (_, __, formId) => [{ type: 'FormById', id: formId }],
        }),
        deleteForm: build.mutation<{ message: string }, { formId: string; templateId: string }>({
            query: ({ formId }) => ({
                url: `/forms/${formId}`,
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
            query: (templateId) => `/forms/aggregated/${templateId}`,
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
