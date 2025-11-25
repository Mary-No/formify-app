import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { setUser } from '../app/authSlice';
import { useLazyGetMeQuery } from '../app/authApi';

export const OAuthCallback = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [triggerGetMe, { data, isSuccess, isError }] = useLazyGetMeQuery();
    const [called, setCalled] = useState(false);


    useEffect(() => {
        const hash = window.location.hash;

        if (hash.startsWith('#token=')) {
            // Google OAuth
            const token = hash.replace('#token=', '');
            localStorage.setItem('accessToken', token);
            triggerGetMe();
            window.history.replaceState(null, '', window.location.pathname);
        } else {
            // Обычная авторизация через сессионные куки
            if (!called) {
                triggerGetMe();
                setCalled(true);
            }
        }
    }, [called, triggerGetMe]);

    useEffect(() => {
        if (isSuccess && data?.user) {
            dispatch(setUser(data.user));
            navigate('/');
        } else if (isError) {
            navigate('/login');
        }
    }, [isSuccess, isError, data, dispatch, navigate]);

    return <p>Logging in via Google...</p>;
};
