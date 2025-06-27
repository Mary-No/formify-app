import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { MyFormsResponse } from '../types/types';

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

export const formApi = createApi({
    reducerPath: 'formApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://formify-app.onrender.com/forms',
        credentials: 'include',
    }),
    endpoints: (build) => ({
        submitForm: build.mutation<SubmitFormResponse, SubmitFormArgs>({
            query: ({ templateId, answers }) => ({
                url: '/',
                method: 'POST',
                body: { templateId, answers },
            }),
        }),
        getMyForms: build.query<MyFormsResponse, { skip?: number }>({
            query: ({ skip = 0 } = {}) => `/mine?skip=${skip}`,
        }),
    }),
});

export const { useSubmitFormMutation,  useGetMyFormsQuery } = formApi;
