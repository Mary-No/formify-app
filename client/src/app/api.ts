import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://formify-app.onrender.com/',
        credentials: 'include',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('accessToken');
            console.log('Adding token to headers:', token);
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Form', 'FormById','Template', 'TemplatesList', 'User'],
    endpoints: () => ({}),
})