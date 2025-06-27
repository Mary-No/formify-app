import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { GlobalLoader } from './GlobalLoader';

export const PrivateRoute = () => {
    const user = useAppSelector(state => state.auth.user);
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const isLoading = useAppSelector(state => state.auth.isLoading)

    if (isLoading) {
        return <GlobalLoader />
    }

    return isAuthenticated && user ? <Outlet /> : <Navigate to="/login" replace />;
};