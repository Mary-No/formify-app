import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://formify-app.onrender.com/',
        credentials: 'include',
    }),
    endpoints: build => ({
        getTags: build.query<{ value: string; count: number }[], number | void>({
            query: (limit = 30) => `templates/tags?limit=${limit}`,
        }),
    }),
})

export const { useGetTagsQuery } = api