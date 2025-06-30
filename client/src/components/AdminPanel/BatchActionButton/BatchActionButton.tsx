import { Button, Modal } from 'antd'
import type { ReactNode } from 'react'
import type { BatchAction } from '../../../types/types'
import s from './BatchActionButton.module.scss'
import {useTranslation} from "react-i18next";

type Props = {
    icon: ReactNode
    action: BatchAction
    label: string
    onConfirm: (action: BatchAction) => void
    selectedRowKeys: string[]
    isSelfAffected: boolean
    isLoading: boolean
}

export const BatchActionButton = ({
                                      icon,
                                      action,
                                      label,
                                      onConfirm,
                                      selectedRowKeys,
                                      isSelfAffected,
                                      isLoading,
                                  }: Props) => {
    const { t } = useTranslation()
    const showConfirm = () => {
        if (action === 'delete') {
            Modal.confirm({
                title:  t('admin.modals.delete.title') ,
                content: t('admin.modals.delete.content'),
                okText:  t('admin.modals.delete.ok'),
                cancelText:  t('admin.modals.cancel'),
                okButtonProps: { danger: true },
                onOk: () => onConfirm(action),
            })
        } else if (action === 'block' && isSelfAffected) {
            Modal.confirm({
                title: t('admin.modals.blockSelf.title'),
                content: t('admin.modals.blockSelf.content'),
                okText: t('admin.modals.blockSelf.ok'),
                cancelText: t('admin.modals.cancel'),
                okButtonProps: { danger: true },
                onOk: () => onConfirm(action),
            })
        }else if (action === 'demote' && isSelfAffected) {
            Modal.confirm({
                title: t('admin.modals.demoteSelf.title'),
                content: t('admin.modals.demoteSelf.content'),
                okText: t('admin.modals.demoteSelf.ok'),
                cancelText: t('admin.modals.cancel'),
                okButtonProps: { danger: true },
                onOk: () => onConfirm(action),
            });
            return;
        } else {
            onConfirm(action)
        }
    }

    return (
        <Button
            icon={icon}
            onClick={showConfirm}
            disabled={selectedRowKeys.length === 0}
            loading={isLoading}
            danger={action === 'delete' || (action === 'block' && isSelfAffected)}
            className={s.button}
        >
            {label}
        </Button>
    )
}
