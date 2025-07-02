import type {RegisterPayload, User, UserLogin, UserResponse} from '../types/types';
import { api } from './api';

export const authApi = api.injectEndpoints({
    endpoints: (build) => ({
        register: build.mutation<UserResponse, RegisterPayload>({
            query: (body) => ({
                url: '/auth/register',
                method: 'POST',
                body,
            }),
        }),
        login: build.mutation<
            { message: string; user: UserLogin },
            { email: string; password: string }
        >({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        getMe: build.query<
            { user: User },
            void
        >({
            query: () => '/auth/me',
        }),
        logout: build.mutation<{ message: string }, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
        }),
    }),
})

export const {  useRegisterMutation,
                useLoginMutation,
                useGetMeQuery,
                useLogoutMutation,
                useLazyGetMeQuery} = authApi

