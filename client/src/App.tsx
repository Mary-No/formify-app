import {BrowserRouter, Route, Routes, useLocation} from "react-router-dom";
import { HomePage } from './pages/HomePage';
import { GlobalLoader } from './components/GlobalLoader';
import { SignUp } from "./pages/SignUp/SignUp.tsx";
import {SignIn} from "./pages/SignIn/SignIn.tsx";
import { MainLayout } from "./components/MainLayout.tsx";
import { useGetMeQuery } from "./app/authApi.ts";
import {useAppDispatch, useAppSelector} from "./app/hooks.ts";
import React, {Suspense, useEffect} from "react";
import {setUser} from "./app/authSlice.ts";
import { PrivateRoute } from "./components/PrivateRoute.tsx";

const TemplatePage = React.lazy(() => import('./pages/TemplatePage.tsx'));
const FillFormPage = React.lazy(() => import('./pages/FillFormPage/FillFormPage.tsx'));
const PersonalAccountPage = React.lazy(() => import('./pages/PersonalAccountPage/PersonalAccountPage.tsx'));
const TemplateBuilder = React.lazy(() => import('./components/TemplateBuilder/TemplateBuilder.tsx'));
const TemplateEditor = React.lazy(() => import('./components/TemplateEditor.tsx'));
const FormEditor = React.lazy(() => import('./components/FormEditor.tsx'));
const StatisticPage = React.lazy(() => import('./pages/StatisticPage/StatisticPage.tsx'));
const OAuthCallback = React.lazy(() => import('./pages/OAuthCallback.tsx'));
const TemplateSearchPage = React.lazy(() => import('./pages/TemplateSearchPage/TemplateSearchPage.tsx'));


function App() {
    return (
        <BrowserRouter>
            <AppWithAuth />
        </BrowserRouter>
    );
}

function AppWithAuth() {
    const dispatch = useAppDispatch();
    const location = useLocation();

    const skipMeQuery = location.pathname.startsWith("/auth/callback");

    const { data } = useGetMeQuery(undefined, { skip: skipMeQuery });
    const currentUser = useAppSelector(state => state.auth.user)

    useEffect(() => {
        if (data?.user && !data.user.isBlocked) {
            if (data.user.id !== currentUser?.id) {
                dispatch(setUser(data.user));
            }
        } else if (currentUser !== null) {
            dispatch(setUser(null));
        }
    }, [data, dispatch, skipMeQuery]);

    return (
        <>
            <GlobalLoader />
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/auth/callback" element={<OAuthCallback />} />
                        <Route path="/register" element={<SignUp />} />
                        <Route path="/login" element={<SignIn />} />
                        <Route path="/search" element={<TemplateSearchPage />} />
                        <Route path="/templates/:templateId" element={<TemplatePage />} />
                        <Route element={<PrivateRoute />}>
                            <Route path="/account" element={<PersonalAccountPage />} />
                            <Route path="/template-builder" element={<TemplateBuilder />} />
                            <Route path="/fill-form/:templateId" element={<FillFormPage />} />
                            <Route path="/edit-template/:templateId" element={<TemplateEditor />} />
                            <Route path="/edit-form/:formId" element={<FormEditor />} />
                            <Route path="/statistic/:templateId" element={<StatisticPage />} />
                        </Route>
                    </Route>
                </Routes>
            </Suspense>
        </>
    );
}

export default App;
