import { useState } from 'react'
import { Dropdown, Menu, Button, Modal, message } from 'antd'
import { MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDeleteTemplateMutation } from '../../app/templateApi'


type Props = {
    templateId: string
}

export const ActionMenu = ({ templateId}: Props) => {
    const { t } = useTranslation()
    const [modalVisible, setModalVisible] = useState(false)
    const [deleteTemplate, { isLoading }] = useDeleteTemplateMutation()

    const showDeleteConfirm = () => {
        setModalVisible(true)
    }

    const handleDelete = async () => {
        try {
            await deleteTemplate(templateId).unwrap()
            message.success(t('action.deleteSuccess'))
            setModalVisible(false)
        } catch {
            message.error(t('action.deleteError'))
        }
    }

    const menu = (
        <Menu>
            <Menu.Item key="edit" icon={<EditOutlined />} >
                {t('action.edit')}
            </Menu.Item>
            <Menu.Item key="delete" icon={<DeleteOutlined />}  onClick={(e) => {
                e.domEvent.preventDefault();
                e.domEvent.stopPropagation();
                showDeleteConfirm();
            }} danger>
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
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                />
            </Dropdown>

            <Modal
                title={t('action.deleteConfirmTitle')}
                visible={modalVisible}
                onOk={handleDelete}
                confirmLoading={isLoading}
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
