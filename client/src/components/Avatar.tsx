import {getRandomColor} from "../utils/getRandomColor.ts";
import {Avatar, Tooltip} from "antd";
import type {User} from "../types/types.ts";
import {Link} from "react-router-dom";
import { useTheme } from "../hooks/useTheme.ts";


type Props = {
    user: User
}

export const UserAvatar=({user}:Props)=>{
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    return <Tooltip title={user?.nickname} styles={{
        body: {
            backgroundColor: isDark ? '#ffffff' : '#1f1f1f',
            color: isDark ? '#1f1f1f' : '#ffffff',
        },
    }}>
        <Link to="/account">
        <Avatar style={{ backgroundColor: user ? getRandomColor(user.id, 0.8) : '#000', cursor: "pointer"}}>{user?.nickname[0].toUpperCase()}</Avatar>
        </Link>
    </Tooltip>
}