import { Input, Table, Space, message } from 'antd'
import { DeleteOutlined, LockOutlined, UnlockOutlined, SearchOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import type React from 'react';
import { useGetUsersQuery, useBatchUsersMutation } from '../../app/adminApi'
import { useState } from 'react'
import { useLogoutMutation } from '../../app/authApi'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { setUser } from '../../app/authSlice'
import { BatchActionButton } from './BatchActionButton/BatchActionButton'
import type {BatchAction} from "../../types/types.ts";
import { useTranslation } from 'react-i18next'
import {getAdminColumns} from "./constants.ts";
import s from './AdminPanel.module.scss'

const { Search } = Input

export const AdminPanel = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
    const [page, setPage] = useState(1)
    const limit = 10
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)
    const [logout] = useLogoutMutation()
    const { data, isLoading, refetch } = useGetUsersQuery({ page, limit, search: searchTerm })
    const [batchUsers, { isLoading: isBatchLoading }] = useBatchUsersMutation()

    const onSearch = (value: string) => {
        setSearchTerm(value.trim())
        setPage(1)
    }
    const isSelfAffected = !!user && selectedRowKeys.includes(user.id)

    const handleBatchAction = async (
        action: BatchAction
    ) => {
        try {
            await batchUsers({ userIds: selectedRowKeys, action }).unwrap()
            message.success(`${t(`admin.actions.${action}`)} ${t('admin.messages.success')}`)
            setSelectedRowKeys([])
            refetch()

            if (isSelfAffected && (action === 'delete' || action === 'block')){
                await logout()
                localStorage.removeItem('accessToken');
                dispatch(setUser(null))
                message.warning(`${t('admin.messages.logout')}${t(`admin.actions.${action}`)}`)
            }
            if(isSelfAffected && action === 'demote'){
                window.location.reload()
            }
        } catch {
            message.error(t('admin.messages.fail'))
        }
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => {
            setSelectedRowKeys(keys.map(String));
        },
    }
    const { t } = useTranslation()
    return (
        <div className={s.container}>
            <Space direction="vertical" style={{width: '100%'}} size="middle">
                <Search
                    placeholder={t('admin.searchPlaceholder')}
                    enterButton={<SearchOutlined/>}
                    allowClear
                    onSearch={onSearch}
                    loading={isLoading}
                    style={{maxWidth: 400}}
                />
                <Space>
                    <BatchActionButton
                        icon={<LockOutlined/>}
                        action="block"
                        label={t('admin.actions.block')}
                        onConfirm={handleBatchAction}
                        selectedRowKeys={selectedRowKeys}
                        isSelfAffected={isSelfAffected}
                        isLoading={isBatchLoading}
                    />
                    <BatchActionButton
                        icon={<UnlockOutlined/>}
                        action="unblock"
                        label={t('admin.actions.unblock')}
                        onConfirm={handleBatchAction}
                        selectedRowKeys={selectedRowKeys}
                        isSelfAffected={isSelfAffected}
                        isLoading={isBatchLoading}
                    />
                    <BatchActionButton
                        icon={<ArrowUpOutlined/>}
                        action="promote"
                        label={t('admin.actions.promote')}
                        onConfirm={handleBatchAction}
                        selectedRowKeys={selectedRowKeys}
                        isSelfAffected={isSelfAffected}
                        isLoading={isBatchLoading}
                    />
                    <BatchActionButton
                        icon={<ArrowDownOutlined/>}
                        action="demote"
                        label={t('admin.actions.demote')}
                        onConfirm={handleBatchAction}
                        selectedRowKeys={selectedRowKeys}
                        isSelfAffected={isSelfAffected}
                        isLoading={isBatchLoading}
                    />
                    <BatchActionButton
                        icon={<DeleteOutlined/>}
                        action="delete"
                        label={t('admin.actions.delete')}
                        onConfirm={handleBatchAction}
                        selectedRowKeys={selectedRowKeys}
                        isSelfAffected={isSelfAffected}
                        isLoading={isBatchLoading}
                    />
                </Space>
                <div className={s.tableWrapper}>
                    <Table
                        scroll={{x: 'max-content'}}
                        className={s.table}
                        rowKey="id"
                        loading={isLoading}
                        columns={getAdminColumns(t)}
                        dataSource={data?.users || []}
                        pagination={{
                            current: page,
                            pageSize: limit,
                            total: data?.total || 0,
                            onChange: (pageNum) => setPage(pageNum),
                        }}
                        rowSelection={rowSelection}
                    />
                </div>
            </Space>
        </div>
)
}
