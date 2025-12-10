import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: 'https://formify-app.onrender.com/',
    credentials: 'include',
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithRefresh: typeof baseQuery = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    const token = localStorage.getItem('accessToken');
    if (!token) return result;
    if (result.error && (result.error.status === 401 || (result.error.data as any)?.error === 'Invalid token')) {
        const refreshResult = await baseQuery('/auth/refresh', api, extraOptions);
        if (refreshResult.data && (refreshResult.data as any).accessToken) {
            const newAccessToken = (refreshResult.data as any).accessToken;
            localStorage.setItem('accessToken', newAccessToken);
            result = await baseQuery(args, api, extraOptions);
        } else {
            localStorage.removeItem('accessToken');
        }
    }

    return result;
};

export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithRefresh,
    tagTypes: ['Form', 'FormById', 'Template', 'TemplatesList', 'User'],
    endpoints: () => ({}),
});
