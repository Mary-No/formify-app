import type { TFunction } from "i18next";

export const getAdminColumns = (t: TFunction) => [
    {
        title: t('nickname'),
        dataIndex: 'nickname',
        key: 'nickname',
    },
    {
        title: t('email'),
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: t('admin.admin'),
        dataIndex: 'isAdmin',
        key: 'isAdmin',
        render: (isAdmin: boolean) => (isAdmin ? '✅' : '❌'),
    },
    {
        title: t('admin.blocked'),
        dataIndex: 'isBlocked',
        key: 'isBlocked',
        render: (isBlocked: boolean) => (isBlocked ? '✅' : '❌'),
    },
    {
        title: t('created'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date: string) => new Date(date).toLocaleString(),
    },
]