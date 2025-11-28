import type { RegisterPayload, User, UserLogin, UserResponse } from '../types/types';
import { api } from './api';
import {logoutAction, setUser} from './authSlice';

export const authApi = api.injectEndpoints({
    endpoints: (build) => ({
        register: build.mutation<UserResponse, RegisterPayload>({
            query: (body) => ({
                url: '/auth/register',
                method: 'POST',
                body,
            }),
        }),
        login: build.mutation<{ accessToken: string; user: UserLogin }, { email: string; password: string }>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    localStorage.setItem('accessToken', data.accessToken);
                    dispatch(authApi.endpoints.getMe.initiate());
                } catch {}
            },
        }),
        getMe: build.query<{ user: User }, void>({
            query: () => ({
                url: '/auth/me',
                method: 'GET',
            }),
        }),
        logout: build.mutation<{ message: string }, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            async onQueryStarted(_, { dispatch }) {
                dispatch(logoutAction());
                dispatch(setUser(null))
            },
        }),
        refresh: build.mutation<{ accessToken: string }, void>({
            query: () => ({
                url: '/auth/refresh',
                method: 'POST',
            }),
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    localStorage.setItem('accessToken', data.accessToken);
                } catch {}
            },
        }),
    }),
});

export const { useRegisterMutation, useLoginMutation, useGetMeQuery, useLazyGetMeQuery, useLogoutMutation, useRefreshMutation } = authApi;
