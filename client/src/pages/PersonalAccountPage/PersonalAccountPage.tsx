import { Button, Tabs, Typography, Space, Spin } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { MyTemplates } from '../../components/MyTemplates/MyTemplates.tsx'
import { MyFilledForms } from '../../components/MyFilledForms/MyFilledForms.tsx'
import s from './PersonalAccountPage.module.scss'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../app/hooks.ts'
import { AdminPanel } from '../../components/AdminPanel/AdminPanel.tsx'

const { Title } = Typography


const PersonalAccountPage = () => {
    const { user, isLoading } = useAppSelector((state) => state.auth)
    const [activeTab, setActiveTab] = useState('my-templates')

    const navigate = useNavigate()
    const { t } = useTranslation()


    const handleCreateTemplate = () => {
        navigate('/template-builder')
    }
    if (isLoading || !user) return <Spin />

    const items = [
        {
            key: 'my-templates',
            label: t('account.myTemplates'),
            children: activeTab === 'my-templates' ? <MyTemplates /> : null,
        },
        {
            key: 'my-filled-forms',
            label: t('account.filledForms'),
            children: activeTab === 'my-filled-forms' ? <MyFilledForms /> : null,
        },
        ...(user?.isAdmin
            ? [
                {
                    key: 'admin-panel',
                    label: t('account.adminPanel'),
                    children: activeTab === 'admin-panel' ? <AdminPanel /> : null,
                },
            ]
            : []),
    ]


    return (
        <div className={s.container}>
            <Space style={{ width: '100%' }} direction="vertical" size="large">
                <Title className={s.title} level={3}>{t('account.title')}</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={handleCreateTemplate}
                >
                    {t('account.createTemplate')}
                </Button>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{ width: '100%' }}
                    items={items}
                    className={s.tabs}
                    type="line"
                />
            </Space>
        </div>
    )
}

export default PersonalAccountPage
