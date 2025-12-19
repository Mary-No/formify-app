import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { setUser } from '../app/authSlice';
import { useLazyGetMeQuery } from '../app/authApi';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [triggerGetMe, { data, isSuccess, isError }] = useLazyGetMeQuery();

    useEffect(() => {
        const hash = window.location.hash;

        if (hash.startsWith('#token=')) {
            const token = hash.replace('#token=', '');
            localStorage.setItem('accessToken', token);
            triggerGetMe();
            window.history.replaceState(null, '', window.location.pathname);
        } else {
            triggerGetMe();
        }
    }, [triggerGetMe]);

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

export default OAuthCallback