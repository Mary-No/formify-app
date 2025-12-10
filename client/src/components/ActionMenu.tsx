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

    const showDeleteConfirm = () => setModalVisible(true)

    const handleDelete = async () => {
        try {
            await onDelete()
            message.success(t('action.deleteSuccess'))
        } catch {
            message.error(t('action.deleteError'))
        } finally {
            setModalVisible(false)
        }
    }

    const createMenuItem = (
        key: string,
        icon: React.ReactNode,
        label: string,
        onClick: () => void,
        danger = false
    ) => (
        <Menu.Item
            key={key}
            icon={icon}
            onClick={(e) => {
                e.domEvent.preventDefault()
                e.domEvent.stopPropagation()
                onClick()
            }}
            danger={danger}
        >
            {label}
        </Menu.Item>
    )

    const menu = (
        <Menu>
            {createMenuItem('edit', <EditOutlined />, t('action.edit'), onEdit)}
            {onStats && createMenuItem('stats', <BarChartOutlined />, t('action.stats'), onStats)}
            {createMenuItem('delete', <DeleteOutlined />, t('action.delete'), showDeleteConfirm, true)}
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
