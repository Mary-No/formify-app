import { configureStore } from '@reduxjs/toolkit'
import { api } from './api'
import { authApi } from './authApi'
import {templateApi} from "./templateApi.ts";
import authReducer from './authSlice.ts'
import {formApi} from "./formApi.ts";

export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        [authApi.reducerPath]: authApi.reducer,
        [templateApi.reducerPath]: templateApi.reducer,
        [formApi.reducerPath]: formApi.reducer,
        auth: authReducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(api.middleware, authApi.middleware, templateApi.middleware, formApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
