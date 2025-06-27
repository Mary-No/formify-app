import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RegisterPayload, UserResponse } from '../types/types';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://formify-app.onrender.com/auth',
        credentials: 'include',
    }),
    endpoints: (build) => ({
        register: build.mutation<UserResponse, RegisterPayload>({
            query: (body) => ({
                url: '/register',
                method: 'POST',
                body,
            }),
        }),
        login: build.mutation<
            { message: string; user: { id: string; email: string; nickname: string } },
            { email: string; password: string }
        >({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        getMe: build.query<
            { user: { id: string; email: string; nickname: string; isAdmin: boolean; isBlocked: boolean } },
            void
        >({
            query: () => '/me',
        }),
        logout: build.mutation<{ message: string }, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
        }),
    }),
})

export const { useRegisterMutation, useLoginMutation,  useGetMeQuery,  useLogoutMutation, } = authApi

