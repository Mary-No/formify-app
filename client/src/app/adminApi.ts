import type {BatchActionPayload, UsersResponse } from '../types/types';
import { api } from './api'



export const adminApi = api.injectEndpoints({
    endpoints: (build) => ({
        getUsers: build.query<UsersResponse, { page?: number; limit?: number; search?: string }>({
            query: ({ page = 1, limit = 10, search = '' }) => ({
                url: '/admin/users',
                params: { page, limit, search },
            }),
            keepUnusedDataFor: 5,
            providesTags: (result) =>
                result
                    ? [
                        ...result.users.map(({ id }) => ({ type: 'User' as const, id })),
                        { type: 'User' as const, id: 'LIST' },
                    ]
                    : [{ type: 'User' as const, id: 'LIST' }],
        }),

        batchUsers: build.mutation<{ message: string }, BatchActionPayload>({
            query: ({ userIds, action }) => ({
                url: '/admin/users/batch',
                method: 'PATCH',
                body: { userIds, action },
            }),
            invalidatesTags: [{ type: 'User' as const, id: 'LIST' }],
        }),
    }),
})

export const { useGetUsersQuery, useBatchUsersMutation } = adminApi
