import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://formify-app.onrender.com/',
        credentials: 'include',
    }),
    tagTypes: ['Form', 'FormById','Template', 'TemplatesList', 'User'],
    endpoints: () => ({}),
})