import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { Button } from 'antd';
import {useToggleLikeTemplateMutation } from '../app/templateApi.ts';
import {useAppSelector} from "../app/hooks.ts";

type Props = {
    templateId: string;
    likesCount: number;
    likedByUser: boolean;
    size: 'big' | 'small';
};

export const Likes = ({ templateId, likesCount, likedByUser, size }: Props) => {
    const [toggleLike, { isLoading }] = useToggleLikeTemplateMutation();
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const onClick = async () => {
        await toggleLike(templateId).unwrap();
    };
    const iconStyle = { fontSize: size === 'big' ? 24 : 16 };

    return (
        <Button
            type="text"
            icon={
                !isAuthenticated || !likedByUser
                    ? <HeartOutlined style={iconStyle} />
                    : <HeartFilled style={{ ...iconStyle, color: 'red' }} />
            }
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick().catch(console.error);
            }}
            loading={isLoading}
            disabled={isLoading || !isAuthenticated}
            style={{ marginLeft: 20, padding: 0 }}
        >
            {likesCount}
        </Button>
    );
};

