import { useState } from 'react'
import { Dropdown, Menu, Button, Modal, message } from 'antd'
import { MoreOutlined, EditOutlined, DeleteOutlined, BarChartOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

type Props = {
    onEdit: () => void
    onDelete: () => Promise<void>
    onStats?: () => void
    loading?: boolean
}

export const ActionMenu = ({ onEdit, onDelete, onStats, loading = false }: Props) => {
    const { t } = useTranslation()
    const [modalVisible, setModalVisible] = useState(false)

    const showDeleteConfirm = () => {
        setModalVisible(true)
    }

    const handleDelete = async () => {
        try {
            await onDelete()
            message.success(t('action.deleteSuccess'))
            setModalVisible(false)
        } catch {
            message.error(t('action.deleteError'))
        }
    }

    const menu = (
        <Menu>
            <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={(e) => {
                    e.domEvent.preventDefault()
                    e.domEvent.stopPropagation()
                    onEdit()
                }}
            >
                {t('action.edit')}
            </Menu.Item>

            {onStats && (
                <Menu.Item
                    key="stats"
                    icon={<BarChartOutlined />}
                    onClick={(e) => {
                        e.domEvent.preventDefault()
                        e.domEvent.stopPropagation()
                        onStats()
                    }}
                >
                    {t('action.stats')}
                </Menu.Item>
            )}

            <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                    e.domEvent.preventDefault()
                    e.domEvent.stopPropagation()
                    showDeleteConfirm()
                }}
                danger
            >
                {t('action.delete')}
            </Menu.Item>
        </Menu>
    )

    return (
        <>
            <Dropdown overlay={menu} trigger={['click']} placement="bottomRight" arrow>
                <Button
                    type="text"
                    icon={<MoreOutlined style={{ fontSize: 20 }} />}
                    aria-label={t('action.openMenu')}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                />
            </Dropdown>

            <Modal
                title={t('action.deleteConfirmTitle')}
                open={modalVisible}
                onOk={handleDelete}
                confirmLoading={loading}
                onCancel={() => setModalVisible(false)}
                okText={t('action.delete')}
                okButtonProps={{ danger: true }}
                cancelText={t('action.cancel')}
            >
                <p>{t('action.deleteConfirmText')}</p>
            </Modal>
        </>
    )
}
