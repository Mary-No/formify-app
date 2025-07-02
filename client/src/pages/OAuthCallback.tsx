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
        if (!called) {
            triggerGetMe();
            setCalled(true);
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
