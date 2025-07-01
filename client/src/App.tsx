import {BrowserRouter, Route, Routes} from "react-router-dom";
import { HomePage } from './pages/HomePage';
import { GlobalLoader } from './components/GlobalLoader';
import { SignUp } from "./pages/SignUp/SignUp.tsx";
import {SignIn} from "./pages/SignIn/SignIn.tsx";
import { TemplateSearchPage } from "./pages/TemplateSearchPage/TemplateSearchPage.tsx";
import { MainLayout } from "./components/MainLayout.tsx";
import { useGetMeQuery } from "./app/authApi.ts";
import { useAppDispatch } from "./app/hooks.ts";
import { useEffect } from "react";
import {setUser} from "./app/authSlice.ts";
import {TemplatePage} from "./pages/TemplatePage.tsx";
import { FillFormPage } from "./pages/FillFormPage.tsx";
import PersonalAccountPage from "./pages/PersonalAccountPage/PersonalAccountPage.tsx";
import { PrivateRoute } from "./components/PrivateRoute.tsx";
import { TemplateBuilder } from "./components/TemplateBuilder/TemplateBuilder.tsx";
import {TemplateEditor} from "./components/TemplateEditor.tsx";
import { FormEditor } from "./components/FormEditor.tsx";
import { StatisticPage } from "./pages/StatisticPage/StatisticPage.tsx";
import { OAuthCallback } from "./pages/OAuthCallback.tsx";

function App() {
    const { data } = useGetMeQuery();

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (data?.user && !data?.user.isBlocked) {
            dispatch(setUser(data.user));
        } else {
            dispatch(setUser(null));
        }
    }, [data, dispatch]);

  return (
      <BrowserRouter>
          <GlobalLoader />
          <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                  <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route path="/register" element={<SignUp />} />
                <Route path="/login" element={<SignIn />} />
                <Route path="/search" element={<TemplateSearchPage />} />
                  <Route path="/templates/:templateId" element={<TemplatePage />} />
                  <Route element={<PrivateRoute />}>
                      <Route path="/account" element={<PersonalAccountPage/>}/>
                      <Route path="/template-builder" element={<TemplateBuilder/>}/>
                      <Route path="/fill-form/:templateId" element={<FillFormPage/>}/>
                      <Route path="/edit-template/:templateId" element={<TemplateEditor/>}/>
                      <Route path="/edit-form/:formId" element={<FormEditor/>}/>
                      <Route path="/statistic/:templateId" element={<StatisticPage/>}/>
                  </Route>
              </Route>
          </Routes>
      </BrowserRouter>
  )
}

export default App
