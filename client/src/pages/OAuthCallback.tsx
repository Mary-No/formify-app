import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetMeQuery } from '../app/authApi';

export const OAuthCallback = () => {
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetMeQuery();

    useEffect(() => {
        if (!isLoading) {
            if (data) {
                navigate('/');
            } else if (isError) {
                navigate('/login');
            }
        }
    }, [isLoading, data, isError, navigate]);

    return null;
};
