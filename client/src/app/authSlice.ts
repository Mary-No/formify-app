import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {AuthUser } from '../types/types'
import { authApi } from './authApi'

type AuthState = {
    isAuthenticated: boolean | null
    user: AuthUser
    isLoading: boolean
}

const initialState: AuthState = {
    isAuthenticated: null,
    user: null,
    isLoading: true
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthenticated(state, action: PayloadAction<boolean>) {
            state.isAuthenticated = action.payload
        },
        setUser(state, action: PayloadAction<AuthState['user']>) {
            state.user = action.payload
            state.isAuthenticated = !!action.payload
        },
        logout(state) {
            state.user = null
            state.isAuthenticated = false
        },
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(
                authApi.endpoints.getMe.matchPending,
                (state) => {
                    state.isLoading = true
                }
            )
            .addMatcher(
                authApi.endpoints.getMe.matchFulfilled,
                (state, action) => {
                    state.isLoading = false
                    if (action.payload?.user && !action.payload.user.isBlocked) {
                        state.user = action.payload.user
                        state.isAuthenticated = true
                    } else {
                        state.user = null
                        state.isAuthenticated = false
                    }
                }
            )
            .addMatcher(
                authApi.endpoints.getMe.matchRejected,
                (state) => {
                    state.isLoading = false
                    state.isAuthenticated = false
                    state.user = null
                }
            )
    }
})

export const { setAuthenticated, setUser, logout } = authSlice.actions
export default authSlice.reducer
